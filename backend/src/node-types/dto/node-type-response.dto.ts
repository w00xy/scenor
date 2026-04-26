import { ApiProperty } from '@nestjs/swagger';

export class NodeTypeResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Уникальный идентификатор типа узла',
  })
  id!: string;

  @ApiProperty({
    example: 'http_request',
    description: 'Уникальный тип узла',
  })
  type!: string;

  @ApiProperty({
    example: 'HTTP Request',
    description: 'Отображаемое название типа узла',
  })
  displayName!: string;

  @ApiProperty({
    example: 'action',
    description: 'Категория узла (trigger, action, logic, data)',
  })
  category!: string;

  @ApiProperty({
    example: 'Sends HTTP requests to external APIs',
    description: 'Описание типа узла',
    nullable: true,
  })
  description!: string | null;

  @ApiProperty({
    example: { url: '', method: 'GET', headers: {} },
    description: 'Конфигурация по умолчанию для узла',
  })
  defaultConfigJson!: any;

  @ApiProperty({
    example: { type: 'object', properties: { url: { type: 'string' } } },
    description: 'JSON Schema для валидации конфигурации',
    nullable: true,
  })
  schemaJson!: any | null;

  @ApiProperty({
    example: true,
    description: 'Поддерживает ли узел учётные данные',
  })
  supportsCredentials!: boolean;

  @ApiProperty({
    example: false,
    description: 'Является ли узел триггером',
  })
  isTrigger!: boolean;

  @ApiProperty({
    example: true,
    description: 'Активен ли тип узла',
  })
  isActive!: boolean;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Дата создания типа узла',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2024-01-20T14:45:00.000Z',
    description: 'Дата последнего обновления',
  })
  updatedAt!: Date;
}
