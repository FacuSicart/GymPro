import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export class TrainerSignupDto {
  @ApiProperty({ example: 'Sofia' })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  firstName!: string;

  @ApiProperty({ example: 'Garcia' })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  lastName!: string;

  @ApiProperty({ example: 'sofia@example.com' })
  @IsEmail()
  @MaxLength(180)
  email!: string;

  @ApiProperty({
    minLength: 8,
    description:
      'Must include at least one uppercase letter, one lowercase letter and one number.',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(passwordPattern, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number and 8 characters.',
  })
  password!: string;
}
