import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../database/prisma.module';
import { RoutineAiController } from './routine-ai.controller';
import { RoutineAiService } from './routine-ai.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [RoutineAiController],
  providers: [RoutineAiService],
})
export class RoutineAiModule {}
