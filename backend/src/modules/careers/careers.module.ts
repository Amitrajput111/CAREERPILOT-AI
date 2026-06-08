import { Module } from '@nestjs/common';
import { CareersService } from './careers.service';
import { CareersController } from './careers.controller';
import { AdminController } from './admin.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CareersController, AdminController],
  providers: [CareersService],
  exports: [CareersService],
})
export class CareersModule {}
