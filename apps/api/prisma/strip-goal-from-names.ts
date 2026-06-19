import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required.');

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const GOAL_SUFFIXES = [' - Fuerza', ' - Hipertrofia', ' - Movilidad', ' - Resistencia', ' - Acondicionamiento'];

function stripGoal(name: string): string {
  for (const suffix of GOAL_SUFFIXES) {
    if (name.endsWith(suffix)) return name.slice(0, -suffix.length);
  }
  return name;
}

async function main() {
  const exercises = await prisma.exercise.findMany({ select: { id: true, name: true } });

  console.log('Muestra de nombres en la BD:');
  exercises.slice(0, 20).forEach((e) => console.log(`  "${e.name}"`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
