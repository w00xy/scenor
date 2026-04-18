import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';

export class RunWorkflowManualDto {
  @ApiPropertyOptional({
    example: { leadId: '123', source: 'landing' },
    description: 'Initial input payload for manual run',
  })
  @IsOptional()
  @IsObject()
  inputDataJson?: Record<string, unknown>;
}

