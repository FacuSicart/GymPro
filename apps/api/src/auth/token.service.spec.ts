import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenService } from './token.service';

describe('TokenService', () => {
  function createService() {
    return new TokenService({
      getOrThrow: jest.fn().mockReturnValue('test-secret'),
    } as unknown as ConfigService);
  }

  it('signs and verifies local JWT payloads', () => {
    const service = createService();

    const token = service.sign({
      sub: 'user-1',
      email: 'trainer@example.com',
      role: 'TRAINER',
      status: 'ACTIVE',
    });

    expect(service.verify(token)).toMatchObject({
      sub: 'user-1',
      email: 'trainer@example.com',
      role: 'TRAINER',
      status: 'ACTIVE',
    });
  });

  it('rejects tampered tokens', () => {
    const service = createService();
    const token = service.sign({
      sub: 'user-1',
      email: 'trainer@example.com',
      role: 'TRAINER',
      status: 'ACTIVE',
    });
    const [header, body] = token.split('.');

    expect(() => service.verify(`${header}.${body}.invalid`)).toThrow(
      UnauthorizedException,
    );
  });

  it('rejects expired tokens', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T00:00:00Z'));
    const service = createService();
    const token = service.sign({
      sub: 'user-1',
      email: 'trainer@example.com',
      role: 'TRAINER',
      status: 'ACTIVE',
    });

    jest.setSystemTime(new Date('2026-01-09T00:00:00Z'));

    expect(() => service.verify(token)).toThrow(UnauthorizedException);
    jest.useRealTimers();
  });
});
