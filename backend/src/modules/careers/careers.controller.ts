import { Controller, Get, Post, Body, Param, UseGuards, Req, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { CareersService } from './careers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api/careers')
export class CareersController {
  constructor(private careersService: CareersService) {}

  @Get('roles')
  async getRoles() {
    return this.careersService.getRoles();
  }

  @Post('analyze-guest-resume')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req: any, file: any, cb: any) => {
      if (file.mimetype !== 'application/pdf') {
        return cb(new BadRequestException('Only PDF resumes are supported'), false);
      }
      cb(null, true);
    }
  }))
  async analyzeGuestResume(
    @Body('targetRoleId') targetRoleId: string,
    @UploadedFile() file: any,
  ) {
    if (!targetRoleId) {
      throw new BadRequestException('No targetRoleId provided');
    }
    if (!file) {
      throw new BadRequestException('No resume file provided');
    }
    return this.careersService.analyzeGuestResume(targetRoleId, file.buffer);
  }

  @Get('assessments/:id')
  @UseGuards(JwtAuthGuard)
  async getAssessment(@Param('id') id: string) {
    return this.careersService.getAssessment(id);
  }

  @Post('assessments/:id/submit')
  @UseGuards(JwtAuthGuard)
  async submitAssessment(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.careersService.submitAssessment(req.user.id, id, body.answers);
  }

  @Get('skills/:id')
  @UseGuards(JwtAuthGuard)
  async getSkillDetails(@Req() req: any, @Param('id') id: string) {
    return this.careersService.getSkillDetails(req.user.id, id);
  }
}
