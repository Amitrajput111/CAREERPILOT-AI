import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { AiModule } from '../ai/ai.module';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule, AiModule],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
