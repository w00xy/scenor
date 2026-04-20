import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateWorkflowNodeDto {
  @ApiProperty({
    example: 'http_request',
    description: 'Node type code',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  type!: string;

  @ApiPropertyOptional({
    example: '3f3899ca-4a8e-40f3-bf72-dd7df43b9ef2',
    description: 'Node type id from node_types table',
  })
  @IsOptional()
  @IsUUID()
  nodeTypeId?: string;

  @ApiPropertyOptional({
    example: 'HTTP Request #1',
    description: 'Internal node name',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    example: 'Get User Data',
    description: 'UI label',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  label?: string;

  @ApiProperty({
    example: 240.5,
    description: 'Node X position on canvas',
  })
  @IsNumber()
  posX!: number;

  @ApiProperty({
    example: 180,
    description: 'Node Y position on canvas',
  })
  @IsNumber()
  posY!: number;

  @ApiPropertyOptional({
    example: { url: 'https://api.example.com/users', method: 'GET' },
    description: 'Node config JSON',
  })
  @IsOptional()
  @IsObject()
  configJson?: Record<string, unknown>;

  @ApiPropertyOptional({
    example: 'f9d47356-59f6-48cc-8e5c-72b1220837d6',
    description: 'Credential id from credentials table (must belong to workflow project)',
  })
  @IsOptional()
  @IsUUID()
  credentialsId?: string;

  @ApiPropertyOptional({
    example: 'Optional node notes',
    description: 'Node notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether node execution is disabled',
  })
  @IsOptional()
  @IsBoolean()
  isDisabled?: boolean;
}
