import { ApiProperty } from '@nestjs/swagger';
import { WorkflowShareResponseDto } from './workflow-share-response.dto.js';

export class WorkflowSharesListResponseDto {
  @ApiProperty({
    type: [WorkflowShareResponseDto],
    description: 'Список ссылок общего доступа для workflow',
  })
  shares!: WorkflowShareResponseDto[];
}
