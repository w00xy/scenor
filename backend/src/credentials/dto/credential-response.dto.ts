import { ApiProperty } from '@nestjs/swagger';

export class CredentialResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Уникальный идентификатор учётных данных',
  })
  id!: string;

  @ApiProperty({
    example: 'Production API Key',
    description: 'Название учётных данных',
  })
  name!: string;

  @ApiProperty({
    example: 'api_key',
    description: 'Тип учётных данных',
  })
  type!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID проекта, к которому принадлежат учётные данные',
  })
  projectId!: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Дата создания учётных данных',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2024-01-20T14:45:00.000Z',
    description: 'Дата последнего обновления',
  })
  updatedAt!: Date;
}
