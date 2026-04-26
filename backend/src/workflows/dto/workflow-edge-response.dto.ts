import { ApiProperty } from '@nestjs/swagger';

export class WorkflowEdgeResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Уникальный идентификатор связи',
  })
  id!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID workflow, к которому принадлежит связь',
  })
  workflowId!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID исходного узла',
  })
  sourceNodeId!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID целевого узла',
  })
  targetNodeId!: string;

  @ApiProperty({
    example: 'output',
    description: 'Название выходного порта исходного узла',
    nullable: true,
  })
  sourceHandle!: string | null;

  @ApiProperty({
    example: 'input',
    description: 'Название входного порта целевого узла',
    nullable: true,
  })
  targetHandle!: string | null;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Дата создания связи',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2024-01-20T14:45:00.000Z',
    description: 'Дата последнего обновления',
  })
  updatedAt!: Date;
}
