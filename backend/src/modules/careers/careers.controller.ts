import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CareersService } from './careers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/careers')
export class CareersController {
  constructor(private careersService: CareersService) {}

  @Get('roles')
  async getRoles() {
    return this.careersService.getRoles();
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
