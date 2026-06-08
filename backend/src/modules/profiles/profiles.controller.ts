import { Controller, Get, Post, Body, UseGuards, UseInterceptors, UploadedFile, Req, BadRequestException } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api/profile')
@UseGuards(JwtAuthGuard)
export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  @Get()
  async getProfile(@Req() req: any) {
    return this.profilesService.getProfile(req.user.id);
  }

  @Post()
  async updateProfile(@Req() req: any, @Body() body: any) {
    return this.profilesService.updateProfile(req.user.id, body);
  }

  @Post('resume')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req: any, file: any, cb: any) => {
      if (file.mimetype !== 'application/pdf') {
        return cb(new BadRequestException('Only PDF resumes are supported'), false);
      }
      cb(null, true);
    }
  }))
  async uploadResume(@Req() req: any, @UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No resume file provided');
    }
    return this.profilesService.handleResumeUpload(req.user.id, file.buffer);
  }
}
