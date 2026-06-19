import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional } from 'class-validator';

export class SendPublicLinkEmailDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;
}
