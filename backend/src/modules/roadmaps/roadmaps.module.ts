import { Module } from '@nestjs/common';
import { RoadmapsService } from './roadmaps.service';
import { RoadmapsController } from './roadmaps.controller';
import { AiModule } from '../ai/ai.module';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule, AiModule],
  controllers: [RoadmapsController],
  providers: [RoadmapsService],
  exports: [RoadmapsService],
})
export class RoadmapsModule {}
