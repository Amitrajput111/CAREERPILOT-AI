import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AiService } from '../ai/ai.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RoadmapGeneratedEvent } from '../../common/events';

@Injectable()
export class RoadmapsService {
  private readonly logger = new Logger(RoadmapsService.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
    private eventEmitter: EventEmitter2,
  ) {}

  async generateRoadmap(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        targetRole: {
          include: {
            skills: { include: { skill: true } },
            projectTemplates: true,
          },
        },
        skills: { include: { skill: true } },
        userAssessments: true,
      },
    });

    if (!profile) throw new NotFoundException('Profile not found');
    if (!profile.targetRoleId || !profile.targetRole) {
      throw new BadRequestException('Target role must be selected before generating a roadmap');
    }

    const targetRole = profile.targetRole;

    // 1. Career Gap Engine
    const targetRoleSkills = targetRole.skills;
    const userSkills = profile.skills;

    const missingSkills: string[] = [];
    const strongAreas: string[] = [];
    const weakAreas: string[] = [];

    for (const roleSkill of targetRoleSkills) {
      const uSkill = userSkills.find(us => us.skillId === roleSkill.skillId);
      if (!uSkill) {
        missingSkills.push(roleSkill.skill.name);
      } else if (uSkill.score >= 70) {
        strongAreas.push(roleSkill.skill.name);
      } else {
        weakAreas.push(roleSkill.skill.name);
        missingSkills.push(roleSkill.skill.name); // gaps include weak scores
      }
    }

    // Average Assessment Score
    let avgQuizScore = 75; // Default baseline if none taken
    if (profile.userAssessments.length > 0) {
      const totalQuizScore = profile.userAssessments.reduce((sum, item) => sum + item.score, 0);
      avgQuizScore = Math.round(totalQuizScore / profile.userAssessments.length);
    }

    // 2. Trigger AI Roadmap generator (Gemini or Fallback)
    const aiRoadmap = await this.aiService.generateRoadmap(
      targetRole.name,
      missingSkills,
      avgQuizScore,
    );

    // 3. Purge existing roadmaps for this profile (MVP limitation: 1 active roadmap)
    const oldRoadmaps = await this.prisma.roadmap.findMany({
      where: { profileId: profile.id },
    });
    for (const old of oldRoadmaps) {
      await this.prisma.roadmap.delete({ where: { id: old.id } });
    }

    // 4. Write Roadmap & Steps to Database
    const createdRoadmap = await this.prisma.roadmap.create({
      data: {
        profileId: profile.id,
        title: aiRoadmap.title || `Roadmap to ${targetRole.name}`,
        durationDays: 90,
        isActive: true,
      },
    });

    for (const step of aiRoadmap.steps) {
      const createdStep = await this.prisma.roadmapStep.create({
        data: {
          roadmapId: createdRoadmap.id,
          phase: step.phase,
          title: step.title,
          description: step.description,
          order: step.order,
        },
      });

      // Create Daily Tasks for each step
      for (const t of step.tasks) {
        await this.prisma.task.create({
          data: {
            roadmapStepId: createdStep.id,
            title: t.title,
            description: t.description,
            status: 'TODO',
          },
        });
      }
    }

    // Emit event
    this.eventEmitter.emit(
      'roadmap.generated',
      new RoadmapGeneratedEvent(userId, createdRoadmap.id),
    );

    // Create Audit Log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: `ROADMAP_GENERATED: ${targetRole.name}`,
      },
    });

    // Calculate final initial readiness score
    const readiness = await this.calculateReadinessScore(profile.id);

    return {
      roadmapId: createdRoadmap.id,
      title: createdRoadmap.title,
      readinessScore: readiness,
      gapAnalysis: {
        missingSkills,
        strongAreas,
        weakAreas,
      },
    };
  }

  async getActiveRoadmap(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });
    if (!profile) throw new NotFoundException('Profile not found');

    const roadmap = await this.prisma.roadmap.findFirst({
      where: { profileId: profile.id, isActive: true },
      include: {
        steps: {
          include: {
            tasks: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!roadmap) {
      return null;
    }

    const readinessDetails = await this.calculateDetailedReadiness(profile.id);

    return {
      ...roadmap,
      readinessScore: readinessDetails.overall,
      readinessDetails,
    };
  }

  async calculateDetailedReadiness(profileId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        targetRole: {
          include: {
            skills: true,
          },
        },
        skills: true,
        userAssessments: true,
        roadmaps: {
          where: { isActive: true },
          include: {
            steps: {
              include: { tasks: true },
            },
          },
        },
      },
    });

    if (!profile || !profile.targetRole) {
      return {
        overall: 0,
        skill: 0,
        project: 0,
        interview: 0,
        roadmap: 0,
        consistency: 0,
      };
    }

    const targetSkills = profile.targetRole.skills;
    const userSkills = profile.skills;

    // 1. Skill Readiness (40%) - users must score >= 70 on required skills
    let skillReadiness = 0;
    if (targetSkills.length > 0) {
      const coveredCount = targetSkills.filter(ts => {
        const us = userSkills.find(u => u.skillId === ts.skillId);
        return us && us.score >= 70;
      }).length;
      skillReadiness = Math.round((coveredCount / targetSkills.length) * 100);
    }

    // 2. Project Readiness (30%) - Phase 3 / Project steps task completion
    let projectReadiness = 50; // default baseline
    const activeRoadmap = profile.roadmaps[0];
    if (activeRoadmap) {
      const projectSteps = activeRoadmap.steps.filter(
        s => s.phase === 3 || s.title.toLowerCase().includes('project') || s.title.toLowerCase().includes('portfolio')
      );
      const projectTasks = projectSteps.flatMap(s => s.tasks);
      if (projectTasks.length > 0) {
        const completedProjects = projectTasks.filter(t => t.status === 'DONE').length;
        projectReadiness = Math.round((completedProjects / projectTasks.length) * 100);
      }
    }

    // 3. Roadmap Completion (20%) - total roadmap task completion rate
    let roadmapProgress = 0;
    if (activeRoadmap) {
      const allTasks = activeRoadmap.steps.flatMap(s => s.tasks);
      if (allTasks.length > 0) {
        const completedTasks = allTasks.filter(t => t.status === 'DONE').length;
        roadmapProgress = Math.round((completedTasks / allTasks.length) * 100);
      }
    }

    // 4. Interview Readiness (10%) - average assessment quiz scores
    let interviewReadiness = 75; // baseline
    if (profile.userAssessments.length > 0) {
      const totalScore = profile.userAssessments.reduce((sum, item) => sum + item.score, 0);
      interviewReadiness = Math.round(totalScore / profile.userAssessments.length);
    }

    // 5. Consistency score (based on task activity streak / completions)
    let consistency = 20; // baseline consistency
    if (activeRoadmap) {
      const allTasks = activeRoadmap.steps.flatMap(s => s.tasks);
      const completedRecent = allTasks.filter(t => t.status === 'DONE' && t.completedAt).length;
      consistency = Math.min(100, Math.max(20, completedRecent * 15));
    }

    // Weighted Formula
    const overallReadiness = Math.round(
      (0.40 * skillReadiness) +
      (0.30 * projectReadiness) +
      (0.20 * roadmapProgress) +
      (0.10 * interviewReadiness)
    );

    return {
      overall: Math.min(100, Math.max(0, overallReadiness)),
      skill: Math.min(100, Math.max(0, skillReadiness)),
      project: Math.min(100, Math.max(0, projectReadiness)),
      interview: Math.min(100, Math.max(0, interviewReadiness)),
      roadmap: Math.min(100, Math.max(0, roadmapProgress)),
      consistency: Math.min(100, Math.max(0, consistency)),
    };
  }

  async calculateReadinessScore(profileId: string): Promise<number> {
    const details = await this.calculateDetailedReadiness(profileId);
    return details.overall;
  }
}
