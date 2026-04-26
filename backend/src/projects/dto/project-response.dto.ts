import { ApiProperty } from '@nestjs/swagger';

export class ProjectResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Уникальный идентификатор проекта',
  })
  id!: string;

  @ApiProperty({
    example: 'My Automation Project',
    description: 'Название проекта',
  })
  name!: string;

  @ApiProperty({
    example: 'Project for automating business workflows',
    description: 'Описание проекта',
    nullable: true,
  })
  description!: string | null;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID владельца проекта',
  })
  ownerId!: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Дата создания проекта',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2024-01-20T14:45:00.000Z',
    description: 'Дата последнего обновления',
  })
  updatedAt!: Date;
}
