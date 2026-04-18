import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    example: 'Automation Playground',
    description: 'Project name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({
    example: 'Internal workflows for team automations',
    description: 'Short project description',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}

