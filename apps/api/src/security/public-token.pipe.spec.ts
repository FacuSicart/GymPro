import { BadRequestException } from '@nestjs/common';
import { PublicTokenPipe } from './public-token.pipe';

describe('PublicTokenPipe', () => {
  const pipe = new PublicTokenPipe();

  it('accepts generated public routine tokens', () => {
    const token = 'a'.repeat(64);

    expect(pipe.transform(token)).toBe(token);
  });

  it('rejects malformed public routine tokens', () => {
    expect(() => pipe.transform('not-a-token')).toThrow(BadRequestException);
  });
});
