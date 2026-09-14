import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { RoadmapsService } from './roadmaps.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private roadmapsService: RoadmapsService) {}

  @Get()
  async getDashboard(@Req() req: any) {
    return this.roadmapsService.getDashboardData(req.user.sub);
  }
}
