import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CareersService {
  constructor(private prisma: PrismaService) {}

  async getRoles() {
    return this.prisma.careerRole.findMany({
      include: {
        skills: {
          include: { skill: true },
        },
        projectTemplates: true,
      },
    });
  }

  async getAssessment(id: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id },
      include: { skill: true },
    });

    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    // Strip answers from questions list before returning to client
    const parsedQuestions = JSON.parse(assessment.questions);
    const questionsWithoutAnswers = parsedQuestions.map((q: any) => ({
      id: q.id,
      text: q.text,
      options: q.options,
    }));

    return {
      id: assessment.id,
      title: assessment.title,
      difficulty: assessment.difficulty,
      skillName: assessment.skill.name,
      questions: questionsWithoutAnswers,
    };
  }

  async submitAssessment(userId: string, assessmentId: string, answers: Array<{ questionId: string; selectedOption: string }>) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { skill: true },
    });

    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });
    if (!profile) throw new NotFoundException('Profile not found');

    const originalQuestions = JSON.parse(assessment.questions);
    let correctCount = 0;

    for (const q of originalQuestions) {
      const userAnswer = answers.find(a => a.questionId === q.id);
      if (userAnswer && userAnswer.selectedOption === q.answer) {
        correctCount++;
      }
    }

    const scorePercentage = Math.round((correctCount / originalQuestions.length) * 100);

    // 1. Save UserAssessment
    await this.prisma.userAssessment.create({
      data: {
        profileId: profile.id,
        assessmentId,
        score: scorePercentage,
      },
    });

    // 2. Update the User's score for the tested skill in UserSkill table
    await this.prisma.userSkill.upsert({
      where: {
        profileId_skillId: {
          profileId: profile.id,
          skillId: assessment.skillId,
        },
      },
      create: {
        profileId: profile.id,
        skillId: assessment.skillId,
        score: scorePercentage,
      },
      update: {
        score: scorePercentage,
      },
    });

    // Save Audit Log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: `ASSESSMENT_COMPLETED: ${assessment.title} - Score: ${scorePercentage}%`,
      },
    });

    return {
      score: scorePercentage,
      totalQuestions: originalQuestions.length,
      correctAnswers: correctCount,
    };
  }

  async getSkillDetails(userId: string, skillId: string) {
    const skill = await this.prisma.skill.findUnique({
      where: { id: skillId },
      include: {
        learningResources: true,
        assessments: true,
        roleSkills: {
          include: { role: true },
        },
      },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        skills: {
          where: { skillId },
        },
      },
    });

    const userSkillScore = profile?.skills[0]?.score ?? 0;

    return {
      id: skill.id,
      name: skill.name,
      description: skill.description,
      userScore: userSkillScore,
      resources: skill.learningResources,
      assessments: skill.assessments,
      usedInRoles: skill.roleSkills.map(rs => rs.role.name),
    };
  }
}
