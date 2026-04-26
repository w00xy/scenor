import { ApiProperty } from '@nestjs/swagger';

export class WorkflowShareResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Уникальный идентификатор ссылки общего доступа',
  })
  id!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID workflow',
  })
  workflowId!: string;

  @ApiProperty({
    example: 'abc123def456',
    description: 'Уникальный токен для доступа к workflow',
  })
  token!: string;

  @ApiProperty({
    example: '2024-12-31T23:59:59.000Z',
    description: 'Дата истечения срока действия ссылки',
    nullable: true,
  })
  expiresAt!: Date | null;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Дата создания ссылки',
  })
  createdAt!: Date;
}
