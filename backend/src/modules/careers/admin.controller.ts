import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private prisma: PrismaService) {}

  private checkAdmin(req: any) {
    if (!req.user || req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Administrative access required');
    }
  }

  @Get('stats')
  async getStats(@Req() req: any) {
    this.checkAdmin(req);
    const usersCount = await this.prisma.user.count();
    const rolesCount = await this.prisma.careerRole.count();
    const skillsCount = await this.prisma.skill.count();
    const assessmentsCount = await this.prisma.assessment.count();
    const resourcesCount = await this.prisma.learningResource.count();

    return {
      users: usersCount,
      roles: rolesCount,
      skills: skillsCount,
      assessments: assessmentsCount,
      resources: resourcesCount,
    };
  }

  @Get('categories')
  async getCategories(@Req() req: any) {
    this.checkAdmin(req);
    return this.prisma.skillCategory.findMany({
      orderBy: { name: 'asc' },
    });
  }

  // --- Career Roles CRUD ---
  @Post('roles')
  async createRole(@Req() req: any, @Body() data: any) {
    this.checkAdmin(req);
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return this.prisma.careerRole.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        salaryRange: data.salaryRange,
        demandScore: data.demandScore ? parseInt(data.demandScore) : 5,
      },
    });
  }

  @Patch('roles/:id')
  async updateRole(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    this.checkAdmin(req);
    return this.prisma.careerRole.update({
      where: { id },
      data: {
        name: data.name ?? undefined,
        description: data.description ?? undefined,
        salaryRange: data.salaryRange ?? undefined,
        demandScore: data.demandScore ? parseInt(data.demandScore) : undefined,
      },
    });
  }

  @Delete('roles/:id')
  async deleteRole(@Req() req: any, @Param('id') id: string) {
    this.checkAdmin(req);
    return this.prisma.careerRole.delete({
      where: { id },
    });
  }

  // --- Skills CRUD ---
  @Post('skills')
  async createSkill(@Req() req: any, @Body() data: any) {
    this.checkAdmin(req);
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return this.prisma.skill.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        categoryId: data.categoryId,
      },
    });
  }

  @Patch('skills/:id')
  async updateSkill(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    this.checkAdmin(req);
    return this.prisma.skill.update({
      where: { id },
      data: {
        name: data.name ?? undefined,
        description: data.description ?? undefined,
        categoryId: data.categoryId ?? undefined,
      },
    });
  }

  @Delete('skills/:id')
  async deleteSkill(@Req() req: any, @Param('id') id: string) {
    this.checkAdmin(req);
    return this.prisma.skill.delete({
      where: { id },
    });
  }

  // --- Role Skill mappings (Knowledge Graph weights) ---
  @Post('role-skills')
  async mapRoleSkill(@Req() req: any, @Body() data: any) {
    this.checkAdmin(req);
    return this.prisma.roleSkill.upsert({
      where: {
        roleId_skillId: {
          roleId: data.roleId,
          skillId: data.skillId,
        },
      },
      create: {
        roleId: data.roleId,
        skillId: data.skillId,
        importance: data.importance ? parseInt(data.importance) : 5,
      },
      update: {
        importance: data.importance ? parseInt(data.importance) : undefined,
      },
    });
  }

  @Delete('role-skills/:roleId/:skillId')
  async unmapRoleSkill(@Req() req: any, @Param('roleId') roleId: string, @Param('skillId') skillId: string) {
    this.checkAdmin(req);
    return this.prisma.roleSkill.delete({
      where: {
        roleId_skillId: {
          roleId,
          skillId,
        },
      },
    });
  }

  // --- Projects CRUD ---
  @Post('projects')
  async createProject(@Req() req: any, @Body() data: any) {
    this.checkAdmin(req);
    return this.prisma.projectTemplate.create({
      data: {
        roleId: data.roleId,
        title: data.title,
        difficulty: data.difficulty || 'Intermediate',
        description: data.description,
      },
    });
  }

  @Delete('projects/:id')
  async deleteProject(@Req() req: any, @Param('id') id: string) {
    this.checkAdmin(req);
    return this.prisma.projectTemplate.delete({
      where: { id },
    });
  }

  // --- Assessments CRUD ---
  @Post('assessments')
  async createAssessment(@Req() req: any, @Body() data: any) {
    this.checkAdmin(req);
    return this.prisma.assessment.create({
      data: {
        skillId: data.skillId,
        title: data.title,
        difficulty: data.difficulty || 'Beginner',
        questions: JSON.stringify(data.questions || []),
      },
    });
  }

  @Delete('assessments/:id')
  async deleteAssessment(@Req() req: any, @Param('id') id: string) {
    this.checkAdmin(req);
    return this.prisma.assessment.delete({
      where: { id },
    });
  }

  // --- Learning Resources CRUD ---
  @Post('resources')
  async createResource(@Req() req: any, @Body() data: any) {
    this.checkAdmin(req);
    return this.prisma.learningResource.create({
      data: {
        skillId: data.skillId,
        title: data.title,
        url: data.url,
        type: data.type || 'DOCUMENTATION',
        difficulty: data.difficulty || 'Beginner',
      },
    });
  }

  @Delete('resources/:id')
  async deleteResource(@Req() req: any, @Param('id') id: string) {
    this.checkAdmin(req);
    return this.prisma.learningResource.delete({
      where: { id },
    });
  }
}
