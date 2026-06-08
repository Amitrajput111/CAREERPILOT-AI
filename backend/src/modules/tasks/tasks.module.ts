import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { RoadmapsModule } from '../roadmaps/roadmaps.module';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule, RoadmapsModule],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
