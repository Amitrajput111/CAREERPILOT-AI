import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { CareersModule } from './modules/careers/careers.module';
import { RoadmapsModule } from './modules/roadmaps/roadmaps.module';
import { TasksModule } from './modules/tasks/tasks.module';

@Module({
  imports: [
    // Global Config
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Event Bus
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),
    DatabaseModule,
    AuthModule,
    ProfilesModule,
    CareersModule,
    RoadmapsModule,
    TasksModule,
  ],
})
export class AppModule {}
