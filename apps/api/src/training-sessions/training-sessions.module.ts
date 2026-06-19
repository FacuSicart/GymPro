import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../database/prisma.module';
import { PublicTrainingSessionsController } from './public-training-sessions.controller';
import { StudentTrainingSessionsController } from './student-training-sessions.controller';
import { TrainingSessionsController } from './training-sessions.controller';
import { TrainingSessionsService } from './training-sessions.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [
    TrainingSessionsController,
    StudentTrainingSessionsController,
    PublicTrainingSessionsController,
  ],
  providers: [TrainingSessionsService],
})
export class TrainingSessionsModule {}
