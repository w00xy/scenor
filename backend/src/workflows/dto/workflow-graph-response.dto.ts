import { ApiProperty } from '@nestjs/swagger';
import { WorkflowNodeResponseDto } from './workflow-node-response.dto.js';
import { WorkflowEdgeResponseDto } from './workflow-edge-response.dto.js';

export class WorkflowGraphResponseDto {
  @ApiProperty({
    type: [WorkflowNodeResponseDto],
    description: 'Список узлов в workflow',
  })
  nodes!: WorkflowNodeResponseDto[];

  @ApiProperty({
    type: [WorkflowEdgeResponseDto],
    description: 'Список связей между узлами',
  })
  edges!: WorkflowEdgeResponseDto[];
}
