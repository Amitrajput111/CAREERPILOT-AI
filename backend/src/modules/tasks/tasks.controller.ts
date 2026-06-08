import { Controller, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Patch(':id')
  async updateTaskStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const { status } = body;
    return this.tasksService.updateTaskStatus(req.user.id, id, status);
  }
}
