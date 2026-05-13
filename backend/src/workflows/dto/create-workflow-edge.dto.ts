import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateWorkflowEdgeDto {
  @ApiProperty({
    example: '80e4f67f-e6d4-4a20-9b2c-f251f60dfd7f',
    description: 'Source node id',
  })
  @IsUUID()
  sourceNodeId!: string;

  @ApiProperty({
    example: 'f4936ca7-88f9-4a67-981f-c4cb6437068c',
    description: 'Target node id',
  })
  @IsUUID()
  targetNodeId!: string;

  @ApiPropertyOptional({
    example: 'success',
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
    example: 'true',
    description: 'Condition type (for branching nodes)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  conditionType?: string;

  @ApiPropertyOptional({
    example: 'Success branch',
    description: 'Connection label',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  label?: string;
}
