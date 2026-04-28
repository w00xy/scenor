import { ApiProperty } from '@nestjs/swagger';
import { WorkflowResponseDto } from './workflow-response.dto.js';

export class WorkflowsListResponseDto extends Array<WorkflowResponseDto> {
  @ApiProperty({
    type: [WorkflowResponseDto],
    description: 'Список workflow в проекте',
  })
  workflows!: WorkflowResponseDto[];
}
