import { ApiProperty } from '@nestjs/swagger';
import { ExecutionStatus } from '@prisma/client';

export class ExecutionResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Уникальный идентификатор выполнения',
  })
  id!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID workflow',
  })
  workflowId!: string;

  @ApiProperty({
    enum: ExecutionStatus,
    example: 'success',
    description: 'Статус выполнения',
  })
  status!: ExecutionStatus;

  @ApiProperty({
    example: { userId: 123, action: 'create' },
    description: 'Входные данные для выполнения',
    nullable: true,
  })
  inputDataJson!: Record<string, unknown> | null;

  @ApiProperty({
    example: { result: 'success', data: { id: 456 } },
    description: 'Результат выполнения',
    nullable: true,
  })
  outputDataJson!: Record<string, unknown> | null;

  @ApiProperty({
    example: 'Connection timeout',
    description: 'Сообщение об ошибке (если есть)',
    nullable: true,
  })
  errorMessage!: string | null;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Время начала выполнения',
  })
  startedAt!: Date;

  @ApiProperty({
    example: '2024-01-15T10:32:15.000Z',
    description: 'Время завершения выполнения',
    nullable: true,
  })
  finishedAt!: Date | null;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Дата создания записи',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2024-01-15T10:32:15.000Z',
    description: 'Дата последнего обновления',
  })
  updatedAt!: Date;
}
