import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required.');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
if (!YOUTUBE_API_KEY) throw new Error('YOUTUBE_API_KEY is required.');

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const MAX_SECONDS = 59;

const fixes = [
  { name: 'Curl con barra', query: 'curl con barra biceps tecnica ejercicio' },
  { name: 'Elevaciones cortas en posición de rana con maquina Smith', query: 'smith machine frog pump exercise technique' },
  { name: 'Elevaciones de cadera acostado lateralmente', query: 'side lying hip raise exercise technique' },
  { name: 'Elevaciones en barra fija con agarre supinado', query: 'chin up supinated grip technique exercise' },
  { name: 'Elevaciones tras nuca en barra fija', query: 'behind the neck pull up exercise technique' },
  { name: 'Levantamiento de pierna acostado de lado', query: 'side lying leg raise exercise technique' },
  { name: 'Peso muerto con balón medicinal', query: 'medicine ball deadlift exercise technique' },
  { name: 'Remo en máquina', query: 'machine row exercise technique back' },
  { name: 'Sentadilla', query: 'sentadilla tecnica correcta ejercicio' },
  { name: 'Sentadilla Posturas funcionales', query: 'squat sit to reach exercise technique' },
  { name: 'Sentadillas con propio peso', query: 'bodyweight squat exercise technique' },
  { name: 'Zancada', query: 'zancada ejercicio tecnica gym' },
] as const;

function parseDurationSeconds(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return Infinity;
  return Number(match[1] ?? 0) * 3600 + Number(match[2] ?? 0) * 60 + Number(match[3] ?? 0);
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function isBadTitle(name: string, title: string): boolean {
  const normalizedName = normalizeText(name);
  const normalizedTitle = normalizeText(title);

  if (normalizedName.includes('zancada') && (normalizedTitle.includes('correr') || normalizedTitle.includes('carrera'))) return true;
  if (normalizedName.includes('remo en maquina') && (normalizedTitle.includes('indoor') || normalizedTitle.includes('ra-500'))) return true;
  if (normalizedName.includes('sentadilla') && normalizedTitle.includes('triceps')) return true;
  if (normalizedName.includes('barra fija') && normalizedTitle.includes('sentadilla')) return true;
  if (normalizedName.includes('curl con barra') && normalizedTitle.includes('polea')) return true;
  return false;
}

async function findShortVideo(name: string, query: string) {
  const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
  searchUrl.searchParams.set('part', 'id,snippet');
  searchUrl.searchParams.set('q', query);
  searchUrl.searchParams.set('type', 'video');
  searchUrl.searchParams.set('videoDuration', 'short');
  searchUrl.searchParams.set('maxResults', '8');
  searchUrl.searchParams.set('key', YOUTUBE_API_KEY!);

  const searchResponse = await fetch(searchUrl);
  if (!searchResponse.ok) {
    throw new Error(`search ${searchResponse.status}: ${await searchResponse.text()}`);
  }

  const searchData = (await searchResponse.json()) as any;
  const ids = (searchData.items ?? []).map((item: any) => item.id?.videoId).filter(Boolean);
  if (ids.length === 0) return null;

  const detailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
  detailsUrl.searchParams.set('part', 'contentDetails,snippet');
  detailsUrl.searchParams.set('id', ids.join(','));
  detailsUrl.searchParams.set('key', YOUTUBE_API_KEY!);

  const detailsResponse = await fetch(detailsUrl);
  if (!detailsResponse.ok) {
    throw new Error(`details ${detailsResponse.status}: ${await detailsResponse.text()}`);
  }

  const detailsData = (await detailsResponse.json()) as any;
  for (const item of detailsData.items ?? []) {
    const durationSeconds = parseDurationSeconds(item.contentDetails?.duration ?? '');
    const title = String(item.snippet?.title ?? '');
    if (durationSeconds <= MAX_SECONDS && !isBadTitle(name, title)) {
      return {
        url: `https://www.youtube.com/watch?v=${item.id}`,
        title,
        durationSeconds,
      };
    }
  }

  return null;
}

async function main() {
  let updated = 0;
  let cleared = 0;

  for (const fix of fixes) {
    const exercise = await prisma.exercise.findFirst({
      where: { name: fix.name },
      select: { id: true, name: true },
    });

    if (!exercise) {
      console.log(`- ${fix.name}: no existe`);
      continue;
    }

    const video = await findShortVideo(fix.name, fix.query);
    if (!video) {
      await prisma.exercise.update({ where: { id: exercise.id }, data: { videoUrl: null } });
      cleared += 1;
      console.log(`- ${fix.name}: sin match confiable < 1 min, limpiado`);
      continue;
    }

    await prisma.exercise.update({ where: { id: exercise.id }, data: { videoUrl: video.url } });
    updated += 1;
    console.log(`✓ ${fix.name}: ${video.url} (${video.durationSeconds}s, ${video.title})`);
  }

  console.log(JSON.stringify({ reviewed: fixes.length, updated, cleared }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
