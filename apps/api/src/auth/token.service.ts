import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';

type LocalJwtPayload = {
  sub: string;
  email: string;
  role: string;
  status: string;
  iat: number;
  exp: number;
};

function base64UrlEncode(value: string | Buffer): string {
  return Buffer.from(value).toString('base64url');
}

function base64UrlJson(value: unknown): string {
  return base64UrlEncode(JSON.stringify(value));
}

@Injectable()
export class TokenService {
  private readonly secret: string;

  constructor(configService: ConfigService) {
    this.secret = configService.getOrThrow<string>('JWT_SECRET');
  }

  sign(payload: Omit<LocalJwtPayload, 'iat' | 'exp'>): string {
    const now = Math.floor(Date.now() / 1000);
    const tokenPayload: LocalJwtPayload = {
      ...payload,
      iat: now,
      exp: now + 60 * 60 * 24 * 7,
    };
    const header = base64UrlJson({ alg: 'HS256', typ: 'JWT' });
    const body = base64UrlJson(tokenPayload);
    const signature = this.signSegments(header, body);

    return `${header}.${body}.${signature}`;
  }

  verify(token: string): LocalJwtPayload {
    const [header, body, signature] = token.split('.');

    if (!header || !body || !signature || token.split('.').length !== 3) {
      throw new UnauthorizedException('Invalid token.');
    }

    this.assertValidHeader(header);

    const expectedSignature = this.signSegments(header, body);
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      throw new UnauthorizedException('Invalid token signature.');
    }

    let payload: LocalJwtPayload;

    try {
      payload = JSON.parse(
        Buffer.from(body, 'base64url').toString('utf8'),
      ) as LocalJwtPayload;
    } catch {
      throw new UnauthorizedException('Invalid token payload.');
    }

    this.assertValidPayload(payload);

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException('Token expired.');
    }

    return payload;
  }

  private signSegments(header: string, body: string): string {
    return createHmac('sha256', this.secret)
      .update(`${header}.${body}`)
      .digest('base64url');
  }

  private assertValidHeader(header: string) {
    try {
      const parsed = JSON.parse(Buffer.from(header, 'base64url').toString('utf8')) as {
        alg?: unknown;
        typ?: unknown;
      };

      if (parsed.alg !== 'HS256' || parsed.typ !== 'JWT') {
        throw new UnauthorizedException('Invalid token header.');
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid token header.');
    }
  }

  private assertValidPayload(payload: LocalJwtPayload) {
    if (
      !payload ||
      typeof payload.sub !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.role !== 'string' ||
      typeof payload.status !== 'string' ||
      typeof payload.iat !== 'number' ||
      typeof payload.exp !== 'number'
    ) {
      throw new UnauthorizedException('Invalid token payload.');
    }
  }
}
