import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { StudentProfileDto } from './student-profile.dto';

export class CreateStudentDto {
  @ApiProperty({ example: 'Martina' })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  firstName!: string;

  @ApiProperty({ example: 'Lopez' })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  lastName!: string;

  @ApiPropertyOptional({ example: 'martina@example.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(180)
  email?: string;

  @ApiPropertyOptional({ example: '+5491112345678' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @ApiPropertyOptional({
    description: 'Required only when an admin creates a student for a trainer.',
  })
  @IsOptional()
  @IsUUID()
  trainerId?: string;

  @ApiPropertyOptional({ type: StudentProfileDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => StudentProfileDto)
  profile?: StudentProfileDto;
}
