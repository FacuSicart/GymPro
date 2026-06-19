import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(scryptCallback);

@Injectable()
export class PasswordService {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(16).toString('base64url');
    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

    return `scrypt:${salt}:${derivedKey.toString('base64url')}`;
  }

  async verify(password: string, storedHash: string): Promise<boolean> {
    const [algorithm, salt, storedKey] = storedHash.split(':');

    if (algorithm !== 'scrypt' || !salt || !storedKey) {
      return false;
    }

    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
    const storedBuffer = Buffer.from(storedKey, 'base64url');

    if (storedBuffer.length !== derivedKey.length) {
      return false;
    }

    return timingSafeEqual(storedBuffer, derivedKey);
  }
}
