import { Controller, Post, Body, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('copilot')
  async askCopilot(@Req() req: any, @Body('message') message: string) {
    if (!message) {
      throw new BadRequestException('Message is required');
    }
    const userId = req.user.userId;
    const response = await this.aiService.queryCopilot(userId, message);
    return { response };
  }
}
