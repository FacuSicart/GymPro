import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { ActiveUserGuard } from '../auth/active-user.guard';
import { CurrentUser } from '../auth/current-user';
import { LocalJwtAuthGuard } from '../auth/local-jwt-auth.guard';
import { PaginationQueryDto } from '../common/pagination-query.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsService } from './students.service';

@ApiTags('students')
@ApiBearerAuth()
@Controller('students')
@UseGuards(LocalJwtAuthGuard, ActiveUserGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @ApiOkResponse({ description: 'Students visible to the current user.' })
  listStudents(@CurrentUser() user: User, @Query() query: PaginationQueryDto) {
    return this.studentsService.listStudents(user, query);
  }

  @Post()
  @ApiCreatedResponse({ description: 'Student created with initial profile.' })
  createStudent(@CurrentUser() user: User, @Body() dto: CreateStudentDto) {
    return this.studentsService.createStudent(user, dto);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Student detail.' })
  getStudent(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.studentsService.getStudent(user, id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Student updated.' })
  updateStudent(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStudentDto,
  ) {
    return this.studentsService.updateStudent(user, id, dto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Student deleted.' })
  deleteStudent(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.studentsService.deleteStudent(user, id);
  }

  @Get(':id/history')
  @ApiOkResponse({ description: 'Student history timeline.' })
  listHistory(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.studentsService.listHistory(user, id, query);
  }
}
