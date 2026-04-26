import { ApiProperty } from '@nestjs/swagger';
import { ExecutionResponseDto } from './execution-response.dto.js';

export class ExecutionsListResponseDto {
  @ApiProperty({
    type: [ExecutionResponseDto],
    description: 'Список выполнений workflow',
  })
  executions!: ExecutionResponseDto[];

  @ApiProperty({
    example: 45,
    description: 'Общее количество выполнений',
  })
  total!: number;
}
