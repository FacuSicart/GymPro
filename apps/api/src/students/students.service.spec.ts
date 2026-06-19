import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  ExerciseGoal,
  StudentHistoryEventType,
  UserRole,
  UserStatus,
} from '@prisma/client';
import { StudentsService } from './students.service';

describe('StudentsService', () => {
  const trainer = {
    id: 'trainer-1',
    tenantId: 'tenant-1',
    role: UserRole.TRAINER,
    status: UserStatus.ACTIVE,
  };

  const otherTrainer = {
    id: 'trainer-2',
    tenantId: 'tenant-2',
    role: UserRole.TRAINER,
    status: UserStatus.ACTIVE,
  };

  const student = {
    id: 'student-1',
    tenantId: trainer.tenantId,
    trainerId: trainer.id,
    firstName: 'Martina',
    lastName: 'Lopez',
    email: null,
    phone: null,
    status: 'ACTIVE',
    profile: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  const tx = {
    student: {
      create: jest.fn(),
      update: jest.fn(),
    },
    studentHistoryEvent: {
      create: jest.fn(),
    },
  };

  const prisma = {
    student: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
    studentHistoryEvent: {
      findMany: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    prisma.$transaction.mockImplementation((callback: (client: typeof tx) => unknown) =>
      callback(tx),
    );
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.student.findFirst.mockResolvedValue(null);
  });

  it('creates trainer-owned students and writes history', async () => {
    tx.student.create.mockResolvedValue({ ...student, profile: {} });
    const service = new StudentsService(prisma as never);

    await service.createStudent(trainer as never, {
      firstName: 'Martina',
      lastName: 'Lopez',
      profile: {
        goal: ExerciseGoal.STRENGTH,
      },
    });

    expect(tx.student.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: trainer.tenantId,
          trainerId: trainer.id,
          firstName: 'Martina',
          lastName: 'Lopez',
        }),
      }),
    );
    expect(tx.studentHistoryEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        studentId: student.id,
        type: StudentHistoryEventType.STUDENT_CREATED,
      }),
    });
  });

  it('prevents trainers assigning students to another trainer', async () => {
    const service = new StudentsService(prisma as never);

    await expect(
      service.createStudent(trainer as never, {
        firstName: 'Martina',
        lastName: 'Lopez',
        trainerId: otherTrainer.id,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects student email already used by a platform user', async () => {
    prisma.user.findFirst.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@example.com',
      role: UserRole.ADMIN,
    });
    const service = new StudentsService(prisma as never);

    await expect(
      service.createStudent(trainer as never, {
        firstName: 'Martina',
        lastName: 'Lopez',
        email: 'ADMIN@example.com',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(tx.student.create).not.toHaveBeenCalled();
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { email: 'admin@example.com' },
    });
  });

  it('rejects duplicate student email for the same trainer', async () => {
    prisma.student.findFirst.mockResolvedValue({
      ...student,
      email: 'martina@example.com',
    });
    const service = new StudentsService(prisma as never);

    await expect(
      service.createStudent(trainer as never, {
        firstName: 'Otra',
        lastName: 'Alumna',
        email: 'martina@example.com',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(tx.student.create).not.toHaveBeenCalled();
  });

  it('filters trainer list by owner', async () => {
    prisma.student.findMany.mockResolvedValue([student]);
    const service = new StudentsService(prisma as never);

    await service.listStudents(trainer as never);

    expect(prisma.student.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { trainerId: trainer.id },
      }),
    );
  });

  it('does not expose another trainer student', async () => {
    prisma.student.findFirst.mockResolvedValue(null);
    const service = new StudentsService(prisma as never);

    await expect(
      service.getStudent(trainer as never, student.id),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.student.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: student.id,
          trainerId: trainer.id,
        },
      }),
    );
  });

  it('writes profile history when profile changes', async () => {
    prisma.student.findFirst.mockResolvedValue(student);
    tx.student.update.mockResolvedValue({
      ...student,
      profile: { goal: ExerciseGoal.MOBILITY },
    });
    const service = new StudentsService(prisma as never);

    await service.updateStudent(trainer as never, student.id, {
      profile: {
        goal: ExerciseGoal.MOBILITY,
      },
    });

    expect(tx.studentHistoryEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: StudentHistoryEventType.PROFILE_UPDATED,
        summary: 'Perfil deportivo actualizado.',
      }),
    });
  });
});
