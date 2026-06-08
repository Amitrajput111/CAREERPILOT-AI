import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TaskCompletedEvent } from '../../common/events';
import { RoadmapsService } from '../roadmaps/roadmaps.service';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private roadmapsService: RoadmapsService,
  ) {}

  async updateTaskStatus(userId: string, taskId: string, status: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });
    if (!profile) throw new NotFoundException('Profile not found');

    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        roadmapStep: {
          include: { roadmap: true },
        },
      },
    });

    if (!task || task.roadmapStep.roadmap.profileId !== profile.id) {
      throw new NotFoundException('Task not found');
    }

    const completedAt = status === 'DONE' ? new Date() : null;

    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        status,
        completedAt,
      },
    });

    // Emit Task Completed Event
    this.eventEmitter.emit(
      'task.completed',
      new TaskCompletedEvent(userId, taskId),
    );

    // Save Audit Log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: `TASK_UPDATED: ${task.title} - Status: ${status}`,
      },
    });

    // Recalculate readiness score
    const newReadiness = await this.roadmapsService.calculateReadinessScore(profile.id);

    return {
      task: updatedTask,
      readinessScore: newReadiness,
    };
  }
}
