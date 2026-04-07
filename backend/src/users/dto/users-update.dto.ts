import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
      example: '123e4567-e89b-12d3-a456-426614174000',
      description: 'User ID',
    })
  @IsUUID()
  id!: string;

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
