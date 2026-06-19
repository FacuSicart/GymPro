import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import type { User } from '@prisma/client';
import { ActiveUserGuard } from '../auth/active-user.guard';
import { CurrentUser } from '../auth/current-user';
import { LocalJwtAuthGuard } from '../auth/local-jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { RejectUserDto } from './dto/reject-user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(LocalJwtAuthGuard, ActiveUserGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('trainers')
  @Roles(UserRole.ADMIN)
  @ApiOkResponse({ description: 'Trainer accounts, optionally filtered by status.' })
  listTrainers(@Query('status') status?: string) {
    return this.usersService.listTrainers(status);
  }

  @Get('pending-trainers')
  @Roles(UserRole.ADMIN)
  @ApiOkResponse({ description: 'Pending trainer accounts in admin tenant.' })
  listPendingTrainers(@CurrentUser() user: User) {
    return this.usersService.listPendingTrainers(user);
  }

  @Patch(':id/approve')
  @Roles(UserRole.ADMIN)
  @ApiOkResponse({ description: 'Trainer approved and activated.' })
  approveTrainer(@CurrentUser() user: User, @Param('id') id: string) {
    return this.usersService.approveTrainer(user, id);
  }

  @Patch(':id/reject')
  @Roles(UserRole.ADMIN)
  @ApiOkResponse({ description: 'Trainer rejected.' })
  rejectTrainer(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: RejectUserDto,
  ) {
    return this.usersService.rejectTrainer(user, id, dto.reason);
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.ADMIN)
  @ApiOkResponse({ description: 'Active trainer virtually deactivated.' })
  deactivateTrainer(@CurrentUser() user: User, @Param('id') id: string) {
    return this.usersService.deactivateTrainer(user, id);
  }
}
