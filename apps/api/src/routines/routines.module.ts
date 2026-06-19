import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../database/prisma.module';
import { PublicRoutinesController } from './public-routines.controller';
import { RoutinesController } from './routines.controller';
import { RoutinesService } from './routines.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [RoutinesController, PublicRoutinesController],
  providers: [RoutinesService],
})
export class RoutinesModule {}
