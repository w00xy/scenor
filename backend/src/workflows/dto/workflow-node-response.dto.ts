import { ApiProperty } from '@nestjs/swagger';

export class WorkflowNodeResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Уникальный идентификатор узла',
  })
  id!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID workflow, к которому принадлежит узел',
  })
  workflowId!: string;

  @ApiProperty({
    example: 'http_request',
    description: 'Тип узла',
  })
  type!: string;

  @ApiProperty({
    example: 'Send API Request',
    description: 'Название узла',
  })
  name!: string;

  @ApiProperty({
    example: { url: 'https://api.example.com', method: 'POST' },
    description: 'Конфигурация узла в формате JSON',
  })
  configJson!: any;

  @ApiProperty({
    example: 100,
    description: 'Позиция X на canvas',
  })
  positionX!: number;

  @ApiProperty({
    example: 200,
    description: 'Позиция Y на canvas',
  })
  positionY!: number;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Дата создания узла',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2024-01-20T14:45:00.000Z',
    description: 'Дата последнего обновления',
  })
  updatedAt!: Date;
}
