import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../database/prisma.module';
import { PublicTrainingFeedbackController } from './public-training-feedback.controller';
import { SessionTrainingFeedbackController } from './session-training-feedback.controller';
import { StudentTrainingFeedbackController } from './student-training-feedback.controller';
import { TrainingFeedbackController } from './training-feedback.controller';
import { TrainingFeedbackService } from './training-feedback.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [
    TrainingFeedbackController,
    StudentTrainingFeedbackController,
    SessionTrainingFeedbackController,
    PublicTrainingFeedbackController,
  ],
  providers: [TrainingFeedbackService],
})
export class TrainingFeedbackModule {}
