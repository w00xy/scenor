import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { WORKFLOW_STATUSES } from './workflow.constants.js';

export class UpdateWorkflowDto {
  @ApiPropertyOptional({
    example: 'Lead Processing Flow v2',
    description: 'Workflow name',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({
    example: 'Updated workflow description',
    description: 'Workflow description',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    example: 'active',
    enum: WORKFLOW_STATUSES,
    description: 'Workflow status',
  })
  @IsOptional()
  @IsIn(WORKFLOW_STATUSES)
  status?: (typeof WORKFLOW_STATUSES)[number];

  @ApiPropertyOptional({
    example: 2,
    description: 'Workflow version',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  version?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether workflow is publicly accessible',
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
