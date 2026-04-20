import { ApiPropertyOptional } from '@nestjs/swagger';
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

export class UpdateWorkflowNodeDto {
  @ApiPropertyOptional({
    example: 'if',
    description: 'Node type code',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  type?: string;

  @ApiPropertyOptional({
    example: '3f3899ca-4a8e-40f3-bf72-dd7df43b9ef2',
    description: 'Node type id from node_types table',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  nodeTypeId?: string;

  @ApiPropertyOptional({
    example: 'IF #1',
    description: 'Internal node name',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    example: 'Check Condition',
    description: 'UI label',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  label?: string;

  @ApiPropertyOptional({
    example: 350,
    description: 'Node X position on canvas',
  })
  @IsOptional()
  @IsNumber()
  posX?: number;

  @ApiPropertyOptional({
    example: 240,
    description: 'Node Y position on canvas',
  })
  @IsOptional()
  @IsNumber()
  posY?: number;

  @ApiPropertyOptional({
    example: { mode: 'all', conditions: [] },
    description: 'Node config JSON',
  })
  @IsOptional()
  @IsObject()
  configJson?: Record<string, unknown>;

  @ApiPropertyOptional({
    example: 'f9d47356-59f6-48cc-8e5c-72b1220837d6',
    description: 'Credential id from credentials table (must belong to workflow project)',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  credentialsId?: string;

  @ApiPropertyOptional({
    example: 'Updated note',
    description: 'Node notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether node execution is disabled',
  })
  @IsOptional()
  @IsBoolean()
  isDisabled?: boolean;
}
