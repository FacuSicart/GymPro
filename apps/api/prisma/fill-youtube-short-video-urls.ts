import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required.');

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

type ExerciseSearchRow = {
  id: string;
  name: string;
  primaryMuscleGroup: string;
  movementPattern: string;
  equipmentNeeded: string;
};

type VideoCandidate = {
  id: string;
  title: string;
  durationSeconds: number;
};

const MAX_SECONDS = 59;
const MAX_PER_RUN = Number(process.env.YOUTUBE_SHORT_MAX_PER_RUN ?? '200');
const REQUEST_DELAY_MS = Number(process.env.YOUTUBE_SHORT_DELAY_MS ?? '800');
const REFRESH_EXISTING = process.env.YOUTUBE_SHORT_REFRESH_EXISTING === 'true';

const sourceSlugByName = loadSourceSlugByName();

function loadSourceSlugByName(): Map<string, string> {
  const map = new Map<string, string>();

  try {
    const seedPath = join(process.cwd(), 'prisma', 'seed-simplyfitness-exercises.ts');
    const source = readFileSync(seedPath, 'utf8');
    const json = source.match(/const simplyFitnessExercises = ([\s\S]*?) satisfies Array/)?.[1];
    if (!json) return map;

    const records = JSON.parse(json) as Array<{ name: string; sourceUrl?: string }>;
    for (const record of records) {
      const slug = record.sourceUrl?.split('/').pop()?.replace(/-/g, ' ').trim();
      if (record.name && slug) map.set(record.name, slug);
    }
  } catch {
    return map;
  }

  return map;
}

function parseDurationSeconds(value: string): number {
  const clean = value.trim();
  if (!clean) return Infinity;

  const parts = clean.split(':').map((part) => Number(part));
  if (parts.some((part) => Number.isNaN(part))) return Infinity;
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return Infinity;
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function importantTokens(value: string): string[] {
  const stopwords = new Set([
    'con',
    'sin',
    'para',
    'de',
    'del',
    'la',
    'el',
    'los',
    'las',
    'un',
    'una',
    'en',
    'a',
    'y',
    'o',
    'ejercicio',
    'tecnica',
    'tutorial',
    'como',
    'hacer',
    'peso',
    'propio',
    'corporal',
    'maquina',
    'máquina',
  ]);

  return normalizeText(value)
    .split(' ')
    .filter((token) => token.length >= 3 && !stopwords.has(token));
}

function buildQueries(exercise: ExerciseSearchRow): string[] {
  const base = exercise.name;
  const context = `${exercise.primaryMuscleGroup} ${exercise.movementPattern}`;
  const sourceSlug = sourceSlugByName.get(exercise.name);
  return [
    `${base} técnica ejercicio`,
    sourceSlug ? `${sourceSlug} exercise technique short` : '',
    `${base} tutorial ejercicio`,
    `${base} ${context} técnica gym`,
  ].filter(Boolean);
}

function extractInitialData(html: string): unknown {
  const marker = 'var ytInitialData = ';
  const start = html.indexOf(marker);
  if (start === -1) return null;

  const jsonStart = start + marker.length;
  const end = html.indexOf(';</script>', jsonStart);
  if (end === -1) return null;

  try {
    return JSON.parse(html.slice(jsonStart, end));
  } catch {
    return null;
  }
}

function collectVideoCandidates(value: unknown, output: VideoCandidate[] = []): VideoCandidate[] {
  if (!value || typeof value !== 'object') return output;

  if ('videoRenderer' in value) {
    const renderer = (value as { videoRenderer?: any }).videoRenderer;
    const id = renderer?.videoId;
    const title =
      renderer?.title?.runs?.map((run: { text?: string }) => run.text ?? '').join('') ??
      renderer?.title?.simpleText ??
      '';
    const durationText =
      renderer?.lengthText?.simpleText ??
      renderer?.lengthText?.accessibility?.accessibilityData?.label ??
      '';
    const durationSeconds = parseDurationSeconds(durationText);

    if (
      typeof id === 'string' &&
      typeof title === 'string' &&
      durationSeconds > 0 &&
      durationSeconds <= MAX_SECONDS
    ) {
      output.push({ id, title, durationSeconds });
    }
  }

  for (const child of Object.values(value)) {
    if (Array.isArray(child)) {
      for (const item of child) collectVideoCandidates(item, output);
    } else {
      collectVideoCandidates(child, output);
    }
  }

  return output;
}

function scoreCandidate(exercise: ExerciseSearchRow, candidate: VideoCandidate): number {
  const title = normalizeText(candidate.title);
  const nameTokens = importantTokens(exercise.name);
  const contextTokens = importantTokens(
    `${exercise.primaryMuscleGroup} ${exercise.movementPattern} ${exercise.equipmentNeeded}`,
  );

  let score = 0;
  let matchedNameTokens = 0;
  for (const token of nameTokens) {
    if (tokenMatches(title, token)) {
      score += 4;
      matchedNameTokens += 1;
    }
  }
  for (const token of contextTokens) {
    if (tokenMatches(title, token)) score += 1;
  }
  if (title.includes('tecnica') || title.includes('tutorial') || title.includes('correct')) score += 2;
  if (title.includes('ejercicio') || title.includes('exercise')) score += 1;
  if (title.includes('short') || candidate.durationSeconds <= 45) score += 1;
  if (title.includes('rutina') || title.includes('workout') || title.includes('compilacion')) score -= 2;
  if (isClearlyWrongResult(exercise, title)) score -= 10;
  if (!hasMinimumNameMatch(exercise, nameTokens, matchedNameTokens, title)) score -= 10;

  return score;
}

function tokenMatches(title: string, token: string): boolean {
  if (title.includes(token)) return true;
  const stem = token.replace(/(es|s)$/i, '');
  return stem.length >= 4 && title.includes(stem);
}

function hasMinimumNameMatch(
  exercise: ExerciseSearchRow,
  nameTokens: string[],
  matchedNameTokens: number,
  title: string,
): boolean {
  const normalizedName = normalizeText(exercise.name);
  const sourceSlug = sourceSlugByName.get(exercise.name);
  const sourceTokens = sourceSlug ? importantTokens(sourceSlug) : [];
  const matchedSourceTokens = sourceTokens.filter((token) => tokenMatches(title, token)).length;

  if (sourceTokens.length > 0 && matchedSourceTokens >= Math.min(2, sourceTokens.length)) return true;
  if (nameTokens.length <= 1) return matchedNameTokens >= 1;
  if (matchedNameTokens >= Math.ceil(nameTokens.length * 0.6)) return true;
  if (normalizedName.includes('sentadilla') && title.includes('sentadilla')) return true;
  if (normalizedName.includes('dominada') && title.includes('dominada')) return true;
  return false;
}

function isClearlyWrongResult(exercise: ExerciseSearchRow, title: string): boolean {
  const name = normalizeText(exercise.name);
  if (name.includes('zancada') && (title.includes('correr') || title.includes('carrera'))) return true;
  if (name.includes('remo en maquina') && (title.includes('indoor') || title.includes('ra 500'))) return true;
  if (name.includes('sentadilla') && title.includes('triceps')) return true;
  if (name.includes('barra fija') && title.includes('sentadilla')) return true;
  if (exercise.primaryMuscleGroup === 'pecho' && title.includes('triceps') && !title.includes('pecho')) return true;
  if (exercise.primaryMuscleGroup === 'tríceps' && title.includes('glute')) return true;
  return false;
}

async function searchYoutube(exercise: ExerciseSearchRow): Promise<VideoCandidate | null> {
  const seen = new Map<string, VideoCandidate>();

  for (const query of buildQueries(exercise)) {
    const url = new URL('https://www.youtube.com/results');
    url.searchParams.set('search_query', query);
    url.searchParams.set('sp', 'EgIYAQ%253D%253D');

    const response = await fetch(url, {
      headers: {
        accept: 'text/html',
        'accept-language': 'es-ES,es;q=0.9,en;q=0.7',
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36',
      },
    });

    if (!response.ok) throw new Error(`YouTube search failed ${response.status}`);

    const html = await response.text();
    const initialData = extractInitialData(html);
    for (const candidate of collectVideoCandidates(initialData)) {
      seen.set(candidate.id, candidate);
    }

    await sleep(REQUEST_DELAY_MS);
  }

  const ranked = [...seen.values()]
    .map((candidate) => ({
      candidate,
      score: scoreCandidate(exercise, candidate),
    }))
    .filter((item) => item.score >= 6)
    .sort((a, b) => b.score - a.score || a.candidate.durationSeconds - b.candidate.durationSeconds);

  return ranked[0]?.candidate ?? null;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const exercises = await prisma.exercise.findMany({
    where: REFRESH_EXISTING ? undefined : { OR: [{ videoUrl: null }, { videoUrl: '' }] },
    select: {
      id: true,
      name: true,
      primaryMuscleGroup: true,
      movementPattern: true,
      equipmentNeeded: true,
    },
    orderBy: { name: 'asc' },
    take: MAX_PER_RUN,
  });

  const total = await prisma.exercise.count({
    where: REFRESH_EXISTING ? undefined : { OR: [{ videoUrl: null }, { videoUrl: '' }] },
  });

  console.log(`Ejercicios sin video en BD: ${total} | procesando: ${exercises.length}`);

  let updated = 0;
  let notFound = 0;

  for (let index = 0; index < exercises.length; index += 1) {
    const exercise = exercises[index];

    try {
      const candidate = await searchYoutube(exercise);
      if (!candidate) {
        await prisma.exercise.update({
          where: { id: exercise.id },
          data: { videoUrl: null },
        });
        notFound += 1;
        console.log(`[${index + 1}/${exercises.length}] - ${exercise.name} - sin video < 1 min`);
        continue;
      }

      const videoUrl = `https://www.youtube.com/watch?v=${candidate.id}`;
      await prisma.exercise.update({
        where: { id: exercise.id },
        data: { videoUrl },
      });
      updated += 1;
      console.log(
        `[${index + 1}/${exercises.length}] ✓ ${exercise.name} -> ${videoUrl} (${candidate.durationSeconds}s, ${candidate.title})`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[${index + 1}/${exercises.length}] Error con "${exercise.name}": ${message}`);
    }
  }

  const remaining = await prisma.exercise.count({
    where: { OR: [{ videoUrl: null }, { videoUrl: '' }] },
  });

  console.log(
    JSON.stringify(
      {
        processed: exercises.length,
        updated,
        notFound,
        remainingWithoutVideo: remaining,
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
