import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class DeleteExecutionDto {
  @ApiProperty({
    description: 'Причина удаления выполнения (для аудита)',
    required: false,
    maxLength: 500,
    example: 'Тестовое выполнение, больше не требуется',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
