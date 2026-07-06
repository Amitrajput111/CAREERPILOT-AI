import { Module } from '@nestjs/common';
import { CareersService } from './careers.service';
import { CareersController } from './careers.controller';
import { AdminController } from './admin.controller';
import { DatabaseModule } from '../../database/database.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [DatabaseModule, AiModule],
  controllers: [CareersController, AdminController],
  providers: [CareersService],
  exports: [CareersService],
})
export class CareersModule {}
