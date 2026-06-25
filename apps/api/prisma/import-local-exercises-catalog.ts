import 'dotenv/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  ExerciseApprovalStatus,
  ExerciseGoal,
  ExerciseOperationalStatus,
  Prisma,
  PrismaClient,
  UserRole,
} from '@prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required.');
}

if (
  process.env.NODE_ENV !== 'development' &&
  process.env.ALLOW_PRODUCTION_EXERCISE_IMPORT !== 'true'
) {
  throw new Error(
    'Refusing to import exercises outside development without ALLOW_PRODUCTION_EXERCISE_IMPORT=true.',
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

type ExerciseCatalogRecord = {
  name: string;
  description: string;
  primaryMuscleGroup: string;
  secondaryMuscleGroups: string[];
  movementPattern: string;
  equipmentNeeded: string;
  equipmentType: string;
  goals: ExerciseGoal[];
  technicalInstructions: string;
  commonMistakes: string | null;
  contraindications: string | null;
  videoUrl: string | null;
  imageUrl: string | null;
  approvalStatus: ExerciseApprovalStatus;
  operationalStatus: ExerciseOperationalStatus;
};

function loadCatalog() {
  const filePath = join(__dirname, 'data', 'local-exercises-catalog.json');
  const records = JSON.parse(readFileSync(filePath, 'utf8')) as Array<
    Omit<ExerciseCatalogRecord, 'goals' | 'secondaryMuscleGroups'> & {
      goals: ExerciseGoal[] | string;
      secondaryMuscleGroups: string[] | string;
    }
  >;

  return records.map((record) => ({
    ...record,
    goals: parsePgArray(record.goals) as ExerciseGoal[],
    secondaryMuscleGroups: parsePgArray(record.secondaryMuscleGroups),
  }));
}

function parsePgArray(value: string[] | string) {
  if (Array.isArray(value)) {
    return value;
  }

  return value
    .replace(/^\{|\}$/g, '')
    .split(',')
    .map((item) => item.replace(/^"|"$/g, '').trim())
    .filter(Boolean);
}

function assertNoDuplicateNames(records: ExerciseCatalogRecord[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const record of records) {
    if (seen.has(record.name)) {
      duplicates.add(record.name);
    }
    seen.add(record.name);
  }

  if (duplicates.size > 0) {
    throw new Error(`Duplicate exercise names: ${Array.from(duplicates).join(', ')}`);
  }
}

async function main() {
  const records = loadCatalog();
  assertNoDuplicateNames(records);

  const admin = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN },
    orderBy: { createdAt: 'asc' },
  });

  if (!admin) {
    throw new Error('Create a first admin before importing exercises.');
  }

  const now = new Date();
  let created = 0;
  let updated = 0;

  for (const record of records) {
    const data: Prisma.ExerciseUncheckedCreateInput = {
      ...record,
      approvalStatus: ExerciseApprovalStatus.APPROVED,
      operationalStatus: ExerciseOperationalStatus.ACTIVE,
      createdByUserId: admin.id,
      reviewedByUserId: admin.id,
      reviewedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    const existing = await prisma.exercise.findFirst({
      where: { name: record.name },
      select: { id: true },
    });

    if (existing) {
      await prisma.exercise.update({
        where: { id: existing.id },
        data: {
          ...data,
          createdAt: undefined,
          createdByUserId: undefined,
        },
      });
      updated += 1;
    } else {
      await prisma.exercise.create({ data });
      created += 1;
    }
  }

  const total = await prisma.exercise.count();
  const approvedActive = await prisma.exercise.count({
    where: {
      approvalStatus: ExerciseApprovalStatus.APPROVED,
      operationalStatus: ExerciseOperationalStatus.ACTIVE,
    },
  });

  console.log(
    JSON.stringify(
      {
        imported: records.length,
        created,
        updated,
        total,
        approvedActive,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
