import { ApiProperty } from '@nestjs/swagger';

export class ExecutionLogResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Уникальный идентификатор лога',
  })
  id!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID выполнения',
  })
  executionId!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID узла workflow',
  })
  nodeId!: string;

  @ApiProperty({
    example: 'SUCCESS',
    description: 'Статус выполнения узла',
  })
  status!: string;

  @ApiProperty({
    example: { url: 'https://api.example.com', method: 'POST' },
    description: 'Входные данные узла',
    nullable: true,
  })
  inputDataJson!: any | null;

  @ApiProperty({
    example: { statusCode: 200, body: { success: true } },
    description: 'Выходные данные узла',
    nullable: true,
  })
  outputDataJson!: any | null;

  @ApiProperty({
    example: 'Connection timeout',
    description: 'Сообщение об ошибке (если есть)',
    nullable: true,
  })
  errorMessage!: string | null;

  @ApiProperty({
    example: '2024-01-15T10:30:05.000Z',
    description: 'Время начала выполнения узла',
  })
  startedAt!: Date;

  @ApiProperty({
    example: '2024-01-15T10:30:08.000Z',
    description: 'Время завершения выполнения узла',
    nullable: true,
  })
  finishedAt!: Date | null;

  @ApiProperty({
    example: '2024-01-15T10:30:05.000Z',
    description: 'Дата создания лога',
  })
  createdAt!: Date;
}
