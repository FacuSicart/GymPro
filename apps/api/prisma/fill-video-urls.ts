import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required.');
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
if (!YOUTUBE_API_KEY) throw new Error('YOUTUBE_API_KEY is required.');

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const GOAL_SUFFIXES = [' - hipertrofia', ' - fuerza', ' - movilidad', ' - resistencia', ' - acondicionamiento'];

function searchName(name: string): string {
  for (const suffix of GOAL_SUFFIXES) {
    if (name.toLowerCase().endsWith(suffix)) return name.slice(0, -suffix.length).trim();
  }
  return name;
}

function parseDurationSeconds(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return Infinity;
  return (parseInt(m[1] ?? '0') * 3600) + (parseInt(m[2] ?? '0') * 60) + parseInt(m[3] ?? '0');
}

async function findVideoUrl(name: string): Promise<string | null> {
  const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
  searchUrl.searchParams.set('part', 'id');
  searchUrl.searchParams.set('q', `${name} ejercicio`);
  searchUrl.searchParams.set('type', 'video');
  searchUrl.searchParams.set('videoDuration', 'short');
  searchUrl.searchParams.set('maxResults', '10');
  searchUrl.searchParams.set('key', YOUTUBE_API_KEY!);

  const searchRes = await fetch(searchUrl.toString());
  if (!searchRes.ok) {
    const err = await searchRes.json() as any;
    throw new Error(`Search error ${searchRes.status}: ${JSON.stringify(err?.error?.message)}`);
  }
  const searchData = await searchRes.json() as any;

  const ids: string[] = (searchData.items ?? []).map((i: any) => i.id?.videoId).filter(Boolean);
  if (!ids.length) return null;

  const detailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
  detailsUrl.searchParams.set('part', 'contentDetails');
  detailsUrl.searchParams.set('id', ids.join(','));
  detailsUrl.searchParams.set('key', YOUTUBE_API_KEY!);

  const detailsRes = await fetch(detailsUrl.toString());
  const detailsData = await detailsRes.json() as any;

  for (const item of detailsData.items ?? []) {
    if (parseDurationSeconds(item.contentDetails.duration) <= 180) {
      return `https://www.youtube.com/watch?v=${item.id}`;
    }
  }
  return null;
}

async function main() {
  const MAX_PER_RUN = 99;

  const exercises = await prisma.exercise.findMany({
    select: { id: true, name: true },
    where: { OR: [{ videoUrl: null }, { videoUrl: '' }] },
    orderBy: { name: 'asc' },
    take: MAX_PER_RUN,
  });

  const total = await prisma.exercise.count({ where: { OR: [{ videoUrl: null }, { videoUrl: '' }] } });
  console.log(`Ejercicios sin video en BD: ${total} | procesando esta corrida: ${exercises.length}`);

  let updated = 0;
  let notFound = 0;

  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i];
    const query = searchName(ex.name);

    try {
      const url = await findVideoUrl(query);
      if (url) {
        await prisma.exercise.update({ where: { id: ex.id }, data: { videoUrl: url } });
        console.log(`[${i + 1}/${exercises.length}] ✓ ${ex.name} → ${url}`);
        updated++;
      } else {
        console.log(`[${i + 1}/${exercises.length}] - ${ex.name} - sin video <= 3 min`);
        notFound++;
      }
    } catch (err: any) {
      if (err?.message?.includes('429') || err?.message?.includes('quotaExceeded')) {
        console.error(`\nCuota diaria agotada en ejercicio ${i + 1}. Actualizados hoy: ${updated}. Volvé a correr mañana.`);
        break;
      }
      console.error(`[${i + 1}] Error con "${ex.name}": ${err?.message}`);
    }

    await new Promise((r) => setTimeout(r, 250));
  }

  console.log(`\nResumen — actualizados: ${updated} | sin video: ${notFound} | pendientes: ${exercises.length - updated - notFound}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
