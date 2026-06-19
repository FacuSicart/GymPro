import { z } from 'zod';

const optionalString = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().optional(),
);
const optionalEmail = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().email().optional(),
);

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
  OPENAI_API_KEY: optionalString,
  AI_MODEL_ROUTINE_GENERATION: optionalString,
  AI_MODEL_SUMMARY: optionalString,
  AI_MAX_CATALOG_ITEMS: z.coerce.number().int().positive().default(80),
  SMTP_HOST: optionalString,
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER: optionalString,
  SMTP_PASS: optionalString,
  SMTP_FROM_EMAIL: optionalEmail,
  SMTP_FROM_NAME: optionalString,
  SENTRY_DSN: optionalString,
});

export type Environment = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Environment {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    throw new Error(`Invalid environment: ${parsed.error.message}`);
  }

  return parsed.data;
}
