import { ApiProperty } from '@nestjs/swagger';
import { NodeTypeResponseDto } from './node-type-response.dto.js';

export class NodeTypesListResponseDto {
  @ApiProperty({
    type: [NodeTypeResponseDto],
    description: 'Список доступных типов узлов',
  })
  nodeTypes!: NodeTypeResponseDto[];
}
