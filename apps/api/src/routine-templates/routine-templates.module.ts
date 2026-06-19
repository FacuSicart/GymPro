import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../database/prisma.module';
import { RoutineTemplatesController } from './routine-templates.controller';
import { RoutineTemplatesService } from './routine-templates.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [RoutineTemplatesController],
  providers: [RoutineTemplatesService],
})
export class RoutineTemplatesModule {}
