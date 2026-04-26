import { ApiProperty } from '@nestjs/swagger';

export class WorkflowResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Уникальный идентификатор workflow',
  })
  id!: string;

  @ApiProperty({
    example: 'Customer Onboarding Flow',
    description: 'Название workflow',
  })
  name!: string;

  @ApiProperty({
    example: 'Automated workflow for onboarding new customers',
    description: 'Описание workflow',
    nullable: true,
  })
  description!: string | null;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID проекта, к которому принадлежит workflow',
  })
  projectId!: string;

  @ApiProperty({
    example: true,
    description: 'Активен ли workflow',
  })
  isActive!: boolean;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Дата создания workflow',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2024-01-20T14:45:00.000Z',
    description: 'Дата последнего обновления',
  })
  updatedAt!: Date;
}
