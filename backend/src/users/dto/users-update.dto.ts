import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'Alex Updated',
    description: 'User display name',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    example: 'alex.updated@example.com',
    description: 'User email address',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'newstrongpass123',
    minLength: 6,
    description: 'User password',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password?: string;
}
