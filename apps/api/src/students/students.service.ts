import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  StudentHistoryEventType,
  User,
  UserRole,
  UserStatus,
} from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { StudentProfileDto } from './dto/student-profile.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import {
  toPublicHistory,
  toPublicStudent,
  toPublicStudents,
} from './student-presenter';

const studentInclude = { profile: true } satisfies Prisma.StudentInclude;

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async listStudents(user: User) {
    const students = await this.prisma.student.findMany({
      where: this.buildListWhere(user),
      include: studentInclude,
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    });

    return toPublicStudents(students);
  }

  async getStudent(user: User, studentId: string) {
    const student = await this.findAccessibleStudent(user, studentId);

    return toPublicStudent(student);
  }

  async createStudent(user: User, dto: CreateStudentDto) {
    const trainer = await this.resolveTrainer(user, dto.trainerId);
    const profileData = this.buildProfileData(dto.profile);
    const email = this.normalizeOptionalEmail(dto.email);

    await this.ensureStudentEmailIsAvailable(email, trainer.id);

    const student = await this.prisma.$transaction(async (tx) => {
      const createdStudent = await tx.student.create({
        data: {
          tenantId: trainer.tenantId,
          trainerId: trainer.id,
          firstName: dto.firstName,
          lastName: dto.lastName,
          email,
          phone: this.normalizeOptionalText(dto.phone),
          profile: {
            create: profileData,
          },
        },
        include: studentInclude,
      });

      await tx.studentHistoryEvent.create({
        data: {
          studentId: createdStudent.id,
          tenantId: createdStudent.tenantId,
          trainerId: createdStudent.trainerId,
          createdByUserId: user.id,
          type: StudentHistoryEventType.STUDENT_CREATED,
          summary: 'Alumno creado.',
          metadata: {
            source: 'students',
          },
        },
      });

      return createdStudent;
    });

    return toPublicStudent(student);
  }

  async updateStudent(user: User, studentId: string, dto: UpdateStudentDto) {
    const currentStudent = await this.findAccessibleStudent(user, studentId);
    const nextEmail =
      dto.email !== undefined ? this.normalizeOptionalEmail(dto.email) : undefined;

    if (nextEmail !== undefined && nextEmail !== currentStudent.email) {
      await this.ensureStudentEmailIsAvailable(
        nextEmail,
        currentStudent.trainerId,
        currentStudent.id,
      );
    }

    const studentData = this.buildStudentUpdateData(dto);
    const profileData = this.buildProfileData(dto.profile);
    const hasStudentChanges = Object.keys(studentData).length > 0;
    const hasProfileChanges = dto.profile !== undefined;

    if (!hasStudentChanges && !hasProfileChanges) {
      return toPublicStudent(currentStudent);
    }

    const updatedStudent = await this.prisma.$transaction(async (tx) => {
      const student = await tx.student.update({
        where: { id: currentStudent.id },
        data: {
          ...studentData,
          ...(hasProfileChanges
            ? {
                profile: {
                  upsert: {
                    create: profileData,
                    update: profileData,
                  },
                },
              }
            : {}),
        },
        include: studentInclude,
      });

      if (hasStudentChanges) {
        await tx.studentHistoryEvent.create({
          data: {
            studentId: student.id,
            tenantId: student.tenantId,
            trainerId: student.trainerId,
            createdByUserId: user.id,
            type: StudentHistoryEventType.STUDENT_UPDATED,
            summary: 'Datos del alumno actualizados.',
            metadata: {
              fields: Object.keys(studentData),
            },
          },
        });
      }

      if (hasProfileChanges) {
        await tx.studentHistoryEvent.create({
          data: {
            studentId: student.id,
            tenantId: student.tenantId,
            trainerId: student.trainerId,
            createdByUserId: user.id,
            type: StudentHistoryEventType.PROFILE_UPDATED,
            summary: 'Perfil deportivo actualizado.',
            metadata: {
              fields: Object.keys(profileData),
            },
          },
        });
      }

      return student;
    });

    return toPublicStudent(updatedStudent);
  }

  async deleteStudent(user: User, studentId: string) {
    const student = await this.findAccessibleStudent(user, studentId);

    await this.prisma.student.delete({
      where: { id: student.id },
    });

    return { deleted: true };
  }

  async listHistory(user: User, studentId: string) {
    const student = await this.findAccessibleStudent(user, studentId);
    const events = await this.prisma.studentHistoryEvent.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' },
    });

    return toPublicHistory(events);
  }

  private buildListWhere(user: User): Prisma.StudentWhereInput {
    switch (user.role) {
      case UserRole.ADMIN:
        return {};
      case UserRole.TRAINER:
        return { trainerId: user.id };
    }
  }

  private async findAccessibleStudent(user: User, studentId: string) {
    const student = await this.prisma.student.findFirst({
      where: {
        id: studentId,
        ...this.buildListWhere(user),
      },
      include: studentInclude,
    });

    if (!student) {
      throw new NotFoundException('Student not found.');
    }

    return student;
  }

  private async resolveTrainer(user: User, trainerId?: string) {
    if (user.role === UserRole.TRAINER) {
      if (trainerId && trainerId !== user.id) {
        throw new ForbiddenException('Trainer cannot assign students to others.');
      }

      return user;
    }

    if (!trainerId) {
      throw new BadRequestException('trainerId is required for admin-created students.');
    }

    const trainer = await this.prisma.user.findFirst({
      where: {
        id: trainerId,
        role: UserRole.TRAINER,
        status: UserStatus.ACTIVE,
      },
    });

    if (!trainer) {
      throw new BadRequestException('Active trainer not found.');
    }

    return trainer;
  }

  private async ensureStudentEmailIsAvailable(
    email: string | null | undefined,
    trainerId: string,
    currentStudentId?: string,
  ) {
    if (!email) {
      return;
    }

    const existingUser = await this.prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email is already used by a platform user.');
    }

    const existingStudent = await this.prisma.student.findFirst({
      where: {
        email,
        trainerId,
        ...(currentStudentId ? { NOT: { id: currentStudentId } } : {}),
      },
    });

    if (existingStudent) {
      throw new ConflictException('Email is already used by another student.');
    }
  }

  private buildStudentUpdateData(
    dto: UpdateStudentDto,
  ): Prisma.StudentUncheckedUpdateInput {
    const data: Prisma.StudentUncheckedUpdateInput = {};

    if (dto.firstName !== undefined) {
      data.firstName = dto.firstName;
    }

    if (dto.lastName !== undefined) {
      data.lastName = dto.lastName;
    }

    if (dto.email !== undefined) {
      data.email = this.normalizeOptionalEmail(dto.email);
    }

    if (dto.phone !== undefined) {
      data.phone = this.normalizeOptionalText(dto.phone);
    }

    return data;
  }

  private buildProfileData(
    profile?: StudentProfileDto,
  ): Prisma.StudentProfileUncheckedCreateWithoutStudentInput {
    return {
      goal: this.normalizeOptionalText(profile?.goal),
      experience: this.normalizeOptionalText(profile?.experience),
      age: profile?.age ?? null,
      weightKg: profile?.weightKg ?? null,
      heightCm: profile?.heightCm ?? null,
      previousPhysicalNotes: this.normalizeOptionalText(
        profile?.previousPhysicalNotes,
      ),
      restrictions: this.normalizeOptionalText(profile?.restrictions),
      recurrentDiscomforts: this.normalizeOptionalText(
        profile?.recurrentDiscomforts,
      ),
      observations: this.normalizeOptionalText(profile?.observations),
    };
  }

  private normalizeOptionalEmail(value?: string) {
    return this.normalizeOptionalText(value)?.toLowerCase() ?? null;
  }

  private normalizeOptionalText(value?: string) {
    const trimmed = value?.trim();

    return trimmed ? trimmed : null;
  }
}
