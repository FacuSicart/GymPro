import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RejectUserDto {
  @ApiPropertyOptional({ example: 'No corresponde al publico objetivo.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
