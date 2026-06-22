import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

const publicTokenPattern = /^[a-f0-9]{64}$/;

@Injectable()
export class PublicTokenPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!publicTokenPattern.test(value)) {
      throw new BadRequestException('Invalid public token.');
    }

    return value;
  }
}
