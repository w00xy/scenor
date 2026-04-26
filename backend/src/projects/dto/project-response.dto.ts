import { ApiProperty } from '@nestjs/swagger';
import { ProjectType, ProjectMemberRole } from '@prisma/client';

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
    enum: ProjectType,
    example: ProjectType.TEAM,
    description: 'Тип проекта',
  })
  type!: ProjectType;

  @ApiProperty({
    example: false,
    description: 'Архивирован ли проект',
  })
  isArchived!: boolean;

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

  @ApiProperty({
    enum: ProjectMemberRole,
    example: ProjectMemberRole.OWNER,
    description: 'Роль пользователя в проекте (только для списка проектов)',
    required: false,
  })
  accessRole?: ProjectMemberRole;
}
