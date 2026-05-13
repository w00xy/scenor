import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { WORKFLOW_STATUSES } from './workflow.constants.js';

export class CreateWorkflowDto {
  @ApiProperty({
    example: 'Lead Processing Flow',
    description: 'Workflow name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({
    example: 'Handles inbound leads and sends notifications',
    description: 'Workflow description',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    example: 'draft',
    enum: WORKFLOW_STATUSES,
    description: 'Workflow status',
  })
  @IsOptional()
  @IsIn(WORKFLOW_STATUSES)
  status?: (typeof WORKFLOW_STATUSES)[number];

  @ApiPropertyOptional({
    example: false,
    description: 'Whether workflow is publicly accessible',
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
