import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  ExerciseApprovalStatus,
  ExerciseGoal,
  ExerciseLevel,
  ExerciseOperationalStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';
import { ExercisesService } from './exercises.service';

describe('ExercisesService', () => {
  const admin = {
    id: 'admin-1',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
  };
  const trainer = {
    id: 'trainer-1',
    role: UserRole.TRAINER,
    status: UserStatus.ACTIVE,
  };
  const exercise = {
    id: 'exercise-1',
    name: 'Sentadilla goblet',
    description: 'Ejercicio de tren inferior.',
    primaryMuscleGroup: 'Piernas',
    secondaryMuscleGroups: ['Gluteos'],
    movementPattern: 'Sentadilla',
    levels: [ExerciseLevel.BEGINNER, ExerciseLevel.INTERMEDIATE],
    equipmentNeeded: 'Mancuerna',
    equipmentType: 'libre',
    goals: [ExerciseGoal.HYPERTROPHY, ExerciseGoal.STRENGTH],
    technicalInstructions: 'Controlar la bajada.',
    commonMistakes: null,
    contraindications: null,
    videoUrl: null,
    imageUrl: null,
    approvalStatus: ExerciseApprovalStatus.APPROVED,
    operationalStatus: ExerciseOperationalStatus.ACTIVE,
    createdByUserId: admin.id,
    reviewedByUserId: admin.id,
    reviewedAt: new Date('2026-01-01T00:00:00Z'),
    rejectionReason: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };
  const pendingProposal = {
    ...exercise,
    id: 'exercise-2',
    approvalStatus: ExerciseApprovalStatus.PENDING,
    operationalStatus: ExerciseOperationalStatus.INACTIVE,
    createdByUserId: trainer.id,
    reviewedByUserId: null,
    reviewedAt: null,
  };

  const prisma = {
    exercise: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      groupBy: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('lets trainers list only approved and active exercises', async () => {
    prisma.exercise.findMany.mockResolvedValue([exercise]);
    const service = new ExercisesService(prisma as never);

    await expect(service.listExercises(trainer as never, {})).resolves.toEqual([
      exercise,
    ]);
    expect(prisma.exercise.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          approvalStatus: ExerciseApprovalStatus.APPROVED,
          operationalStatus: ExerciseOperationalStatus.ACTIVE,
        },
      }),
    );
  });

  it('creates admin exercises as approved and active', async () => {
    prisma.exercise.create.mockResolvedValue(exercise);
    const service = new ExercisesService(prisma as never);

    await service.createExercise(admin as never, {
      name: exercise.name,
      description: exercise.description,
      primaryMuscleGroup: exercise.primaryMuscleGroup,
      movementPattern: exercise.movementPattern,
      levels: exercise.levels,
      equipmentNeeded: exercise.equipmentNeeded,
      goals: exercise.goals,
      technicalInstructions: exercise.technicalInstructions,
    });

    expect(prisma.exercise.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        approvalStatus: ExerciseApprovalStatus.APPROVED,
        operationalStatus: ExerciseOperationalStatus.ACTIVE,
        createdByUserId: admin.id,
        reviewedByUserId: admin.id,
        reviewedAt: expect.any(Date) as Date,
      }),
    });
  });

  it('creates trainer proposals as pending and inactive', async () => {
    prisma.exercise.create.mockResolvedValue(pendingProposal);
    const service = new ExercisesService(prisma as never);

    await service.createExercise(trainer as never, {
      name: exercise.name,
      description: exercise.description,
      primaryMuscleGroup: exercise.primaryMuscleGroup,
      movementPattern: exercise.movementPattern,
      levels: exercise.levels,
      equipmentNeeded: exercise.equipmentNeeded,
      goals: exercise.goals,
      technicalInstructions: exercise.technicalInstructions,
    });

    expect(prisma.exercise.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        approvalStatus: ExerciseApprovalStatus.PENDING,
        operationalStatus: ExerciseOperationalStatus.INACTIVE,
        createdByUserId: trainer.id,
        reviewedByUserId: null,
        reviewedAt: null,
      }),
    });
  });

  it('prevents trainers from seeing another trainer pending proposal', async () => {
    prisma.exercise.findUnique.mockResolvedValue({
      ...pendingProposal,
      createdByUserId: 'other-trainer',
    });
    const service = new ExercisesService(prisma as never);

    await expect(
      service.getExercise(trainer as never, pendingProposal.id),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('approves proposals and activates them', async () => {
    prisma.exercise.findUnique.mockResolvedValue(pendingProposal);
    prisma.exercise.update.mockResolvedValue({
      ...pendingProposal,
      approvalStatus: ExerciseApprovalStatus.APPROVED,
      operationalStatus: ExerciseOperationalStatus.ACTIVE,
    });
    const service = new ExercisesService(prisma as never);

    await service.approveExercise(admin as never, pendingProposal.id);

    expect(prisma.exercise.update).toHaveBeenCalledWith({
      where: { id: pendingProposal.id },
      data: expect.objectContaining({
        approvalStatus: ExerciseApprovalStatus.APPROVED,
        operationalStatus: ExerciseOperationalStatus.ACTIVE,
        reviewedByUserId: admin.id,
        reviewedAt: expect.any(Date) as Date,
        rejectionReason: null,
      }),
    });
  });

  it('prevents activating pending exercises', async () => {
    prisma.exercise.findUnique.mockResolvedValue(pendingProposal);
    const service = new ExercisesService(prisma as never);

    await expect(
      service.setOperationalStatus(
        admin as never,
        pendingProposal.id,
        ExerciseOperationalStatus.ACTIVE,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('prevents trainers from changing operational status', async () => {
    const service = new ExercisesService(prisma as never);

    await expect(
      service.setOperationalStatus(
        trainer as never,
        exercise.id,
        ExerciseOperationalStatus.INACTIVE,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
