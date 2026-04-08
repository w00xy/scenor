import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User ID',
  })
  @IsUUID()
  userId!: string;

  @ApiPropertyOptional({
    example: 'Alex',
    description: 'First name',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Johnson',
    description: 'Last name',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({
    example: 'Automation engineer and workflow enthusiast',
    description: 'User bio',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({
    example: '+79998887766',
    description: 'Phone number',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/avatar/alex.jpg',
    description: 'Avatar URL',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsUrl()
  @MaxLength(2048)
  avatarUrl?: string;
}
