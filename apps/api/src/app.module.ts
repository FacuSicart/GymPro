import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { validateEnv } from './config/env.validation';
import { DashboardModule } from './dashboard/dashboard.module';
import { PrismaModule } from './database/prisma.module';
import { ExercisesModule } from './exercises/exercises.module';
import { HealthModule } from './health/health.module';
import { RoutinesModule } from './routines/routines.module';
import { RoutineAiModule } from './routine-ai/routine-ai.module';
import { RoutineTemplatesModule } from './routine-templates/routine-templates.module';
import { StudentsModule } from './students/students.module';
import { TrainingFeedbackModule } from './training-feedback/training-feedback.module';
import { TrainingSessionsModule } from './training-sessions/training-sessions.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    PrismaModule,
    AuthModule,
    DashboardModule,
    UsersModule,
    StudentsModule,
    ExercisesModule,
    RoutinesModule,
    RoutineAiModule,
    RoutineTemplatesModule,
    TrainingSessionsModule,
    TrainingFeedbackModule,
    HealthModule,
  ],
})
export class AppModule {}
