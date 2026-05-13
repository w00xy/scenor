import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class UpdateWorkflowEdgeDto {
  @ApiPropertyOptional({
    example: '80e4f67f-e6d4-4a20-9b2c-f251f60dfd7f',
    description: 'Source node id',
  })
  @IsOptional()
  @IsUUID()
  sourceNodeId?: string;

  @ApiPropertyOptional({
    example: 'f4936ca7-88f9-4a67-981f-c4cb6437068c',
    description: 'Target node id',
  })
  @IsOptional()
  @IsUUID()
  targetNodeId?: string;

  @ApiPropertyOptional({
    example: 'error',
    description: 'Source handle id',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sourceHandle?: string;

  @ApiPropertyOptional({
    example: 'input',
    description: 'Target handle id',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  targetHandle?: string;

  @ApiPropertyOptional({
    example: 'false',
    description: 'Condition type (for branching nodes)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  conditionType?: string;

  @ApiPropertyOptional({
    example: 'Error branch',
    description: 'Connection label',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  label?: string;
}
