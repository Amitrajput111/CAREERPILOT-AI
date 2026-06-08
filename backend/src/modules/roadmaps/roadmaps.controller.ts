import { Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { RoadmapsService } from './roadmaps.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/roadmaps')
@UseGuards(JwtAuthGuard)
export class RoadmapsController {
  constructor(private roadmapsService: RoadmapsService) {}

  @Post('generate')
  async generateRoadmap(@Req() req: any) {
    return this.roadmapsService.generateRoadmap(req.user.id);
  }

  @Get('active')
  async getActiveRoadmap(@Req() req: any) {
    return this.roadmapsService.getActiveRoadmap(req.user.id);
  }
}
