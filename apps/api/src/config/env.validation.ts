import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  API_GLOBAL_PREFIX: z.string().min(1).default('api'),
  WEB_ORIGIN: z.string().url().default('http://localhost:3000'),
  DATABASE_URL: z.string().min(1),
  DIRECT_DATABASE_URL: z.string().min(1).optional(),
  JWT_AUDIENCE: z.string().min(1).default('authenticated'),
  JWT_SECRET: z.string().min(32),
  OPENAI_API_KEY: z.string().optional(),
  AI_MODEL_ROUTINE_GENERATION: z.string().optional(),
  AI_MODEL_SUMMARY: z.string().optional(),
  AI_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
  AI_MAX_CATALOG_ITEMS: z.coerce.number().int().positive().default(80),
  SENTRY_DSN: z.string().optional(),
});

export type Environment = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Environment {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    throw new Error(`Invalid environment: ${parsed.error.message}`);
  }

  return parsed.data;
}
