import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ResumeUploadedEvent } from '../../common/events';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PDFParse } = require('pdf-parse');
import { AiService } from '../ai/ai.service';

@Injectable()
export class ProfilesService {
  private readonly logger = new Logger(ProfilesService.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private aiService: AiService,
  ) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        targetRole: {
          include: {
            skills: {
              include: { skill: true },
            },
            projectTemplates: true,
          },
        },
        skills: {
          include: { skill: true },
        },
        userAssessments: {
          include: { assessment: { include: { skill: true } } },
        },
        resumeData: true,
        aiReports: true,
        user: {
          include: {
            auditLogs: {
              orderBy: { timestamp: 'desc' },
              take: 8,
            },
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async updateProfile(userId: string, data: any) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');

    const updatedProfile = await this.prisma.profile.update({
      where: { userId },
      data: {
        name: data.name ?? undefined,
        college: data.college ?? undefined,
        university: data.university ?? undefined,
        branch: data.branch ?? undefined,
        graduationYear: data.graduationYear !== undefined ? parseInt(data.graduationYear) : undefined,
        location: data.location ?? undefined,
        experienceYrs: data.experienceYrs !== undefined ? parseInt(data.experienceYrs) : undefined,
        targetRoleId: data.targetRoleId ?? undefined,
      },
    });

    // Create Audit Log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: `PROFILE_UPDATED: ${JSON.stringify(Object.keys(data))}`,
      },
    });

    return updatedProfile;
  }

  async handleResumeUpload(userId: string, buffer: Buffer) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');

    let rawText = '';
    try {
      const uint8 = new Uint8Array(buffer);
      const parser = new PDFParse(uint8);
      const parsedPdf = await parser.getText();
      rawText = parsedPdf.text || '';
    } catch (err) {
      this.logger.error('Error parsing PDF content:', err);
      throw new Error('Failed to parse PDF resume format');
    }

    // Upsert raw resume data text
    await this.prisma.resumeData.upsert({
      where: { profileId: profile.id },
      create: {
        profileId: profile.id,
        rawText,
        parsedSkills: '[]',
        parsedProjects: '[]',
        parsedJobs: '[]',
      },
      update: {
        rawText,
      },
    });

    // Emit event asynchronously
    this.eventEmitter.emit(
      'resume.uploaded',
      new ResumeUploadedEvent(userId, rawText),
    );

    // Save Audit Log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'RESUME_UPLOADED',
      },
    });

    return {
      message: 'Resume file received. Processing background AI parsing...',
      status: 'PROCESSING',
    };
  }

  @OnEvent('resume.uploaded')
  async handleResumeUploadedEvent(event: ResumeUploadedEvent) {
    const { userId, rawText } = event;
    this.logger.log(`⏳ Background parsing start for user ${userId}...`);

    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { targetRole: true }
    });
    if (!profile) return;

    try {
      // 1. Call AI Service (Gemini/Fallback matches)
      const parsedData = await this.aiService.parseResume(rawText);

      // 2. Save structured JSON to ResumeData
      await this.prisma.resumeData.update({
        where: { profileId: profile.id },
        data: {
          parsedSkills: JSON.stringify(parsedData.skills),
          parsedProjects: JSON.stringify(parsedData.projects),
          parsedJobs: JSON.stringify(parsedData.jobs),
        },
      });

      // 3. Match against core skills and upsert UserSkill entries
      const allSkills = await this.prisma.skill.findMany({});
      
      for (const skillName of parsedData.skills) {
        const matchingSkill = allSkills.find(
          s => s.name.toLowerCase() === skillName.toLowerCase() || s.slug === skillName.toLowerCase()
        );
        
        if (matchingSkill) {
          await this.prisma.userSkill.upsert({
            where: {
              profileId_skillId: {
                profileId: profile.id,
                skillId: matchingSkill.id,
              },
            },
            create: {
              profileId: profile.id,
              skillId: matchingSkill.id,
              score: 75, // baseline parsed score
            },
            update: {
              score: 75,
            },
          });
        }
      }

      // 4. Generate Resume Analysis report and save to database
      const allSkillsNames = allSkills.map(s => s.name);
      const targetRoleName = profile.targetRole?.name || 'General Software Developer';
      const analysis = await this.aiService.generateResumeAnalysis(
        targetRoleName,
        parsedData.skills,
        allSkillsNames
      );

      const existingReport = await this.prisma.aiReport.findFirst({
        where: {
          profileId: profile.id,
          reportType: 'RESUME_ANALYSIS',
        },
      });

      if (existingReport) {
        await this.prisma.aiReport.update({
          where: { id: existingReport.id },
          data: {
            payload: JSON.stringify(analysis),
          },
        });
      } else {
        await this.prisma.aiReport.create({
          data: {
            profileId: profile.id,
            reportType: 'RESUME_ANALYSIS',
            payload: JSON.stringify(analysis),
          },
        });
      }

      this.logger.log(`✅ Background parsing complete for user ${userId}. Skills mapped and AI Analysis report generated.`);
    } catch (err) {
      this.logger.error(`❌ Background parsing failed for user ${userId}:`, err);
    }
  }
}
