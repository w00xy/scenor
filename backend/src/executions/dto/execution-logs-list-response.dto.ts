import { ApiProperty } from '@nestjs/swagger';
import { ExecutionLogResponseDto } from './execution-log-response.dto.js';

export class ExecutionLogsListResponseDto {
  @ApiProperty({
    type: [ExecutionLogResponseDto],
    description: 'Список логов выполнения узлов',
  })
  logs!: ExecutionLogResponseDto[];

  @ApiProperty({
    example: 12,
    description: 'Общее количество логов',
  })
  total!: number;
}
