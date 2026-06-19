import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  ExerciseApprovalStatus,
  ExerciseGoal,
  ExerciseLevel,
  ExerciseOperationalStatus,
  Prisma,
  PrismaClient,
  UserRole,
} from '@prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

type EquipmentType = 'libre' | 'maquina' | 'polea';

type ExerciseTemplate = {
  name: string;
  movementPattern: string;
  equipmentNeeded: string;
  equipmentType: EquipmentType;
  secondaryMuscleGroups: string[];
};

const requiredGoals = [
  ExerciseGoal.HYPERTROPHY,
  ExerciseGoal.STRENGTH,
  ExerciseGoal.MOBILITY,
  ExerciseGoal.ENDURANCE,
  ExerciseGoal.CONDITIONING,
] as const;

const goalLabels: Record<ExerciseGoal, string> = {
  HYPERTROPHY: 'hipertrofia',
  STRENGTH: 'fuerza',
  MOBILITY: 'movilidad',
  ENDURANCE: 'resistencia',
  CONDITIONING: 'acondicionamiento',
};

const requiredGroups = [
  'pecho',
  'espalda',
  'hombros',
  'bíceps',
  'tríceps',
  'cuádriceps',
  'isquiosurales',
  'glúteos',
  'gemelos',
  'abdomen/core',
] as const;

const templatesByGroup: Record<
  (typeof requiredGroups)[number],
  ExerciseTemplate[]
> = {
  pecho: [
    template(
      'Press de banca con barra',
      'Empuje horizontal',
      'Barra y banco',
      'libre',
      ['tríceps', 'hombros'],
    ),
    template(
      'Press de banca con mancuernas',
      'Empuje horizontal',
      'Mancuernas y banco',
      'libre',
      ['tríceps', 'hombros'],
    ),
    template(
      'Press inclinado con mancuernas',
      'Empuje inclinado',
      'Mancuernas y banco inclinado',
      'libre',
      ['hombros', 'tríceps'],
    ),
    template(
      'Aperturas con mancuernas',
      'Aducción horizontal',
      'Mancuernas y banco',
      'libre',
      ['hombros'],
    ),
    template(
      'Press de pecho en máquina',
      'Empuje horizontal',
      'Máquina de press de pecho',
      'maquina',
      ['tríceps', 'hombros'],
    ),
    template(
      'Press inclinado en máquina',
      'Empuje inclinado',
      'Máquina de press inclinado',
      'maquina',
      ['hombros', 'tríceps'],
    ),
    template('Pec deck', 'Aducción horizontal', 'Máquina pec deck', 'maquina', [
      'hombros',
    ]),
    template(
      'Cruce de poleas',
      'Aducción horizontal',
      'Poleas altas',
      'polea',
      ['hombros'],
    ),
  ],
  espalda: [
    template('Remo con barra', 'Tirón horizontal', 'Barra', 'libre', [
      'bíceps',
      'hombros',
    ]),
    template(
      'Remo con mancuerna a una mano',
      'Tirón horizontal',
      'Mancuerna y banco',
      'libre',
      ['bíceps', 'core'],
    ),
    template(
      'Peso muerto convencional',
      'Bisagra de cadera',
      'Barra',
      'libre',
      ['glúteos', 'isquiosurales'],
    ),
    template(
      'Pullover con mancuerna',
      'Extensión de hombro',
      'Mancuerna y banco',
      'libre',
      ['pecho', 'tríceps'],
    ),
    template(
      'Jalón al pecho en polea',
      'Tirón vertical',
      'Polea alta',
      'polea',
      ['bíceps', 'hombros'],
    ),
    template(
      'Remo sentado en polea',
      'Tirón horizontal',
      'Polea baja',
      'polea',
      ['bíceps', 'hombros'],
    ),
    template(
      'Remo en máquina',
      'Tirón horizontal',
      'Máquina de remo',
      'maquina',
      ['bíceps', 'hombros'],
    ),
    template(
      'Pullover en polea',
      'Extensión de hombro',
      'Polea alta',
      'polea',
      ['pecho', 'tríceps'],
    ),
  ],
  hombros: [
    template('Press militar con barra', 'Empuje vertical', 'Barra', 'libre', [
      'tríceps',
      'core',
    ]),
    template(
      'Press de hombros con mancuernas',
      'Empuje vertical',
      'Mancuernas',
      'libre',
      ['tríceps'],
    ),
    template(
      'Elevaciones laterales con mancuernas',
      'Abducción de hombro',
      'Mancuernas',
      'libre',
      ['trapecio'],
    ),
    template(
      'Pájaros con mancuernas',
      'Abducción horizontal',
      'Mancuernas',
      'libre',
      ['espalda alta'],
    ),
    template(
      'Press de hombros en máquina',
      'Empuje vertical',
      'Máquina de press de hombros',
      'maquina',
      ['tríceps'],
    ),
    template(
      'Elevación lateral en máquina',
      'Abducción de hombro',
      'Máquina de elevación lateral',
      'maquina',
      ['trapecio'],
    ),
    template(
      'Face pull en polea',
      'Tirón hacia la cara',
      'Polea con cuerda',
      'polea',
      ['espalda alta', 'bíceps'],
    ),
    template(
      'Elevación lateral en polea',
      'Abducción de hombro',
      'Polea baja',
      'polea',
      ['trapecio'],
    ),
  ],
  bíceps: [
    template('Curl con barra', 'Flexión de codo', 'Barra', 'libre', [
      'antebrazos',
    ]),
    template(
      'Curl alterno con mancuernas',
      'Flexión de codo',
      'Mancuernas',
      'libre',
      ['antebrazos'],
    ),
    template('Curl martillo', 'Flexión de codo', 'Mancuernas', 'libre', [
      'antebrazos',
    ]),
    template(
      'Curl inclinado con mancuernas',
      'Flexión de codo',
      'Mancuernas y banco inclinado',
      'libre',
      ['antebrazos'],
    ),
    template('Curl en polea baja', 'Flexión de codo', 'Polea baja', 'polea', [
      'antebrazos',
    ]),
    template(
      'Curl predicador en máquina',
      'Flexión de codo',
      'Máquina predicador',
      'maquina',
      ['antebrazos'],
    ),
    template(
      'Curl con cuerda en polea',
      'Flexión de codo',
      'Polea baja con cuerda',
      'polea',
      ['antebrazos'],
    ),
    template(
      'Curl de bíceps en máquina',
      'Flexión de codo',
      'Máquina de bíceps',
      'maquina',
      ['antebrazos'],
    ),
  ],
  tríceps: [
    template(
      'Press cerrado con barra',
      'Empuje horizontal',
      'Barra y banco',
      'libre',
      ['pecho', 'hombros'],
    ),
    template(
      'Extensión francesa con barra EZ',
      'Extensión de codo',
      'Barra EZ',
      'libre',
      ['hombros'],
    ),
    template(
      'Patada de tríceps con mancuerna',
      'Extensión de codo',
      'Mancuerna',
      'libre',
      ['hombros'],
    ),
    template(
      'Extensión sobre cabeza con mancuerna',
      'Extensión de codo',
      'Mancuerna',
      'libre',
      ['hombros'],
    ),
    template(
      'Jalón de tríceps en polea',
      'Extensión de codo',
      'Polea alta',
      'polea',
      ['hombros'],
    ),
    template(
      'Extensión de tríceps con cuerda',
      'Extensión de codo',
      'Polea alta con cuerda',
      'polea',
      ['hombros'],
    ),
    template(
      'Press de tríceps en máquina',
      'Empuje de codo',
      'Máquina de tríceps',
      'maquina',
      ['pecho'],
    ),
    template(
      'Extensión de tríceps en máquina',
      'Extensión de codo',
      'Máquina de extensión de tríceps',
      'maquina',
      ['hombros'],
    ),
  ],
  cuádriceps: [
    template('Sentadilla trasera', 'Sentadilla', 'Barra', 'libre', [
      'glúteos',
      'core',
    ]),
    template('Sentadilla frontal', 'Sentadilla', 'Barra', 'libre', [
      'glúteos',
      'core',
    ]),
    template('Zancada con mancuernas', 'Zancada', 'Mancuernas', 'libre', [
      'glúteos',
      'isquiosurales',
    ]),
    template(
      'Sentadilla goblet',
      'Sentadilla',
      'Mancuerna o kettlebell',
      'libre',
      ['glúteos', 'core'],
    ),
    template(
      'Prensa de piernas',
      'Empuje de piernas',
      'Máquina de prensa',
      'maquina',
      ['glúteos', 'isquiosurales'],
    ),
    template(
      'Hack squat en máquina',
      'Sentadilla guiada',
      'Máquina hack squat',
      'maquina',
      ['glúteos'],
    ),
    template(
      'Extensión de piernas',
      'Extensión de rodilla',
      'Máquina de extensión de piernas',
      'maquina',
      ['flexores de cadera'],
    ),
    template(
      'Sentadilla en máquina Smith',
      'Sentadilla guiada',
      'Máquina Smith',
      'maquina',
      ['glúteos', 'core'],
    ),
  ],
  isquiosurales: [
    template('Peso muerto rumano', 'Bisagra de cadera', 'Barra', 'libre', [
      'glúteos',
      'espalda',
    ]),
    template('Buenos días con barra', 'Bisagra de cadera', 'Barra', 'libre', [
      'glúteos',
      'espalda',
    ]),
    template(
      'Peso muerto piernas rígidas',
      'Bisagra de cadera',
      'Barra o mancuernas',
      'libre',
      ['glúteos', 'espalda'],
    ),
    template(
      'Swing con kettlebell',
      'Bisagra dinámica',
      'Kettlebell',
      'libre',
      ['glúteos', 'core'],
    ),
    template(
      'Curl femoral tumbado',
      'Flexión de rodilla',
      'Máquina de curl femoral tumbado',
      'maquina',
      ['gemelos'],
    ),
    template(
      'Curl femoral sentado',
      'Flexión de rodilla',
      'Máquina de curl femoral sentado',
      'maquina',
      ['gemelos'],
    ),
    template(
      'Curl femoral de pie',
      'Flexión de rodilla',
      'Máquina de curl femoral de pie',
      'maquina',
      ['gemelos'],
    ),
    template(
      'Pull-through en polea',
      'Bisagra de cadera',
      'Polea baja con cuerda',
      'polea',
      ['glúteos', 'core'],
    ),
  ],
  glúteos: [
    template(
      'Hip thrust con barra',
      'Extensión de cadera',
      'Barra y banco',
      'libre',
      ['isquiosurales', 'core'],
    ),
    template(
      'Puente de glúteos con barra',
      'Extensión de cadera',
      'Barra',
      'libre',
      ['isquiosurales'],
    ),
    template(
      'Sentadilla sumo con mancuerna',
      'Sentadilla',
      'Mancuerna',
      'libre',
      ['cuádriceps', 'aductores'],
    ),
    template('Peso muerto sumo', 'Bisagra de cadera', 'Barra', 'libre', [
      'isquiosurales',
      'espalda',
    ]),
    template(
      'Hip thrust en máquina',
      'Extensión de cadera',
      'Máquina de hip thrust',
      'maquina',
      ['isquiosurales'],
    ),
    template(
      'Patada de glúteo en polea',
      'Extensión de cadera',
      'Polea baja',
      'polea',
      ['isquiosurales'],
    ),
    template(
      'Patada de glúteo en máquina',
      'Extensión de cadera',
      'Máquina de glúteo',
      'maquina',
      ['isquiosurales'],
    ),
    template(
      'Abducción de cadera en máquina',
      'Abducción de cadera',
      'Máquina abductora',
      'maquina',
      ['glúteo medio'],
    ),
  ],
  gemelos: [
    template(
      'Elevación de talones con mancuernas',
      'Flexión plantar',
      'Mancuernas',
      'libre',
      ['tibial posterior'],
    ),
    template(
      'Elevación de talones unilateral',
      'Flexión plantar',
      'Mancuerna',
      'libre',
      ['core'],
    ),
    template(
      'Elevación de talones tipo farmer carry',
      'Flexión plantar',
      'Mancuernas',
      'libre',
      ['antebrazos', 'core'],
    ),
    template(
      'Donkey calf raise con carga',
      'Flexión plantar',
      'Disco o carga externa',
      'libre',
      ['isquiosurales'],
    ),
    template(
      'Elevación de gemelos de pie en máquina',
      'Flexión plantar',
      'Máquina de gemelos de pie',
      'maquina',
      ['sóleo'],
    ),
    template(
      'Elevación de gemelos sentado',
      'Flexión plantar',
      'Máquina de gemelos sentado',
      'maquina',
      ['sóleo'],
    ),
    template(
      'Gemelos en prensa',
      'Flexión plantar',
      'Máquina de prensa',
      'maquina',
      ['sóleo'],
    ),
    template(
      'Elevación de gemelos en Smith',
      'Flexión plantar',
      'Máquina Smith',
      'maquina',
      ['sóleo'],
    ),
  ],
  'abdomen/core': [
    template('Crunch con disco', 'Flexión de tronco', 'Disco', 'libre', [
      'oblicuos',
    ]),
    template(
      'Russian twist con balón medicinal',
      'Rotación de tronco',
      'Balón medicinal',
      'libre',
      ['oblicuos', 'flexores de cadera'],
    ),
    template(
      'Sit-up con carga',
      'Flexión de tronco',
      'Disco o mancuerna',
      'libre',
      ['flexores de cadera'],
    ),
    template('Plancha con carga', 'Antiextensión', 'Disco', 'libre', [
      'glúteos',
      'hombros',
    ]),
    template(
      'Crunch en polea',
      'Flexión de tronco',
      'Polea alta con cuerda',
      'polea',
      ['oblicuos'],
    ),
    template(
      'Rotación de torso en máquina',
      'Rotación de tronco',
      'Máquina de torso',
      'maquina',
      ['oblicuos'],
    ),
    template(
      'Crunch abdominal en máquina',
      'Flexión de tronco',
      'Máquina abdominal',
      'maquina',
      ['flexores de cadera'],
    ),
    template(
      'Woodchop en polea',
      'Rotación diagonal',
      'Polea alta o baja',
      'polea',
      ['oblicuos', 'hombros'],
    ),
  ],
};

function template(
  name: string,
  movementPattern: string,
  equipmentNeeded: string,
  equipmentType: EquipmentType,
  secondaryMuscleGroups: string[],
): ExerciseTemplate {
  return {
    name,
    movementPattern,
    equipmentNeeded,
    equipmentType,
    secondaryMuscleGroups,
  };
}

function buildExercises(adminId: string) {
  const now = new Date();
  const records: Prisma.ExerciseUncheckedCreateInput[] = [];
  const goals = [...requiredGoals];

  for (const group of requiredGroups) {
    for (const exercise of templatesByGroup[group]) {
      records.push({
        name: exercise.name,
        description: `${exercise.name} para ${group}. Aplicable a ${goals.map((goal) => goalLabels[goal]).join(', ')}; la dosificación se define después en rutinas.`,
        primaryMuscleGroup: group,
        secondaryMuscleGroups: exercise.secondaryMuscleGroups,
        movementPattern: exercise.movementPattern,
        levels: inferLevels(exercise),
        equipmentNeeded: exercise.equipmentNeeded,
        equipmentType: exercise.equipmentType,
        goals,
        technicalInstructions: buildTechnicalInstructions(exercise, group),
        commonMistakes: buildCommonMistakes(exercise.equipmentType),
        contraindications:
          'Evitar cargas o rangos que generen dolor. Ajustar técnica, carga o variante si hay molestias previas reportadas.',
        videoUrl: null,
        imageUrl: null,
        approvalStatus: ExerciseApprovalStatus.APPROVED,
        operationalStatus: ExerciseOperationalStatus.ACTIVE,
        createdByUserId: adminId,
        reviewedByUserId: adminId,
        reviewedAt: now,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  return records;
}

function inferLevels(exercise: ExerciseTemplate) {
  const advancedNames = [
    'Peso muerto',
    'Press militar',
    'Buenos días',
    'Swing',
    'Sentadilla frontal',
    'Peso muerto sumo',
  ];

  if (advancedNames.some((name) => exercise.name.includes(name))) {
    return [ExerciseLevel.INTERMEDIATE, ExerciseLevel.ADVANCED];
  }

  if (
    exercise.equipmentType === 'maquina' ||
    exercise.equipmentType === 'polea'
  ) {
    return [ExerciseLevel.BEGINNER, ExerciseLevel.INTERMEDIATE];
  }

  return [ExerciseLevel.BEGINNER, ExerciseLevel.INTERMEDIATE];
}

function buildTechnicalInstructions(exercise: ExerciseTemplate, group: string) {
  return [
    `Preparar ${exercise.equipmentNeeded.toLowerCase()} y adoptar una posición estable antes de iniciar.`,
    `Ejecutar el patrón de ${exercise.movementPattern.toLowerCase()} dirigiendo el esfuerzo principal a ${group}.`,
    'Mantener respiración controlada, columna neutra y articulaciones alineadas durante todo el recorrido.',
    'La carga, repeticiones, descanso e intensidad se definen en la rutina según el objetivo.',
  ].join(' ');
}

function buildCommonMistakes(equipmentType: EquipmentType) {
  const equipmentCue =
    equipmentType === 'libre'
      ? 'balancear la carga'
      : equipmentType === 'polea'
        ? 'dejar que la polea tire del cuerpo'
        : 'depender del recorrido guiado sin controlar la postura';

  return `Usar impulso excesivo, perder alineación articular, acortar el recorrido o ${equipmentCue}.`;
}

function assertLocalDevelopment() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isLocalDatabase =
    connectionString?.includes('localhost') ||
    connectionString?.includes('127.0.0.1');

  if (!isDevelopment || !isLocalDatabase) {
    throw new Error(
      [
        'Refusing to delete and reseed exercises outside local/dev.',
        `NODE_ENV=${process.env.NODE_ENV ?? '(empty)'}`,
        `DATABASE_URL=${connectionString ?? '(empty)'}`,
      ].join(' '),
    );
  }
}

function assertNoDuplicateNames(
  records: Prisma.ExerciseUncheckedCreateInput[],
) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const record of records) {
    if (seen.has(record.name)) {
      duplicates.add(record.name);
    }
    seen.add(record.name);
  }

  if (duplicates.size > 0) {
    throw new Error(
      `Duplicate exercise names: ${Array.from(duplicates).join(', ')}`,
    );
  }
}

function buildCoverageReport(records: Prisma.ExerciseUncheckedCreateInput[]) {
  const byGoal = countByExpanded(records, (record) => record.goals as string[]);
  const byLevel = countByExpanded(
    records,
    (record) => record.levels as string[],
  );
  const byGroup = countBy(records, (record) => record.primaryMuscleGroup);
  const byEquipmentType = countBy(records, (record) =>
    String(record.equipmentType),
  );
  const completeCombinations: string[] = [];
  const incompleteCombinations: string[] = [];

  for (const goal of requiredGoals) {
    for (const group of requiredGroups) {
      const scoped = records.filter(
        (record) =>
          (record.goals as ExerciseGoal[]).includes(goal) &&
          record.primaryMuscleGroup === group,
      );
      const freeCount = scoped.filter(
        (record) => record.equipmentType === 'libre',
      ).length;
      const machineOrCableCount = scoped.filter(
        (record) =>
          record.equipmentType === 'maquina' ||
          record.equipmentType === 'polea',
      ).length;
      const label = `${goal} + ${group}: libre=${freeCount}, maquina/polea=${machineOrCableCount}`;

      if (freeCount >= 4 && machineOrCableCount >= 4) {
        completeCombinations.push(label);
      } else {
        incompleteCombinations.push(label);
      }
    }
  }

  return {
    total: records.length,
    byGoal,
    byLevel,
    byGroup,
    byEquipmentType,
    completeCombinations,
    incompleteCombinations,
    withoutVideoUrl: records.filter((record) => !record.videoUrl).length,
    withoutImageUrl: records.filter((record) => !record.imageUrl).length,
    sources: [
      'ACE Fitness Exercise Library: https://www.acefitness.org/resources/everyone/exercise-library/',
      'Wikipedia - List of weight training exercises: https://en.wikipedia.org/wiki/List_of_weight_training_exercises',
    ],
  };
}

function countBy<T>(records: T[], getKey: (record: T) => string) {
  return records.reduce<Record<string, number>>((accumulator, record) => {
    const key = getKey(record);
    accumulator[key] = (accumulator[key] ?? 0) + 1;
    return accumulator;
  }, {});
}

function countByExpanded<T>(records: T[], getKeys: (record: T) => string[]) {
  return records.reduce<Record<string, number>>((accumulator, record) => {
    for (const key of getKeys(record)) {
      accumulator[key] = (accumulator[key] ?? 0) + 1;
    }

    return accumulator;
  }, {});
}

async function main() {
  assertLocalDevelopment();

  const admin = await prisma.user.findFirst({
    where: {
      role: UserRole.ADMIN,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  if (!admin) {
    throw new Error('Create a first admin before seeding exercises.');
  }

  const records = buildExercises(admin.id);
  assertNoDuplicateNames(records);
  const report = buildCoverageReport(records);

  if (report.incompleteCombinations.length > 0) {
    throw new Error(
      `Coverage is incomplete: ${report.incompleteCombinations.join('; ')}`,
    );
  }

  await prisma.exercise.deleteMany();
  await prisma.exercise.createMany({
    data: records,
  });

  console.log(JSON.stringify(report, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
