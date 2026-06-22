import { SetMetadata } from '@nestjs/common';

export type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

export const RATE_LIMIT_OPTIONS = 'rateLimitOptions';

export function RateLimit(options: RateLimitOptions) {
  return SetMetadata(RATE_LIMIT_OPTIONS, options);
}
