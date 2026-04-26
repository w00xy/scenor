import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Уникальный идентификатор пользователя',
  })
  id!: string;

  @ApiProperty({
    example: 'Alex',
    description: 'Имя пользователя',
  })
  username!: string;

  @ApiProperty({
    example: 'alex@example.com',
    description: 'Email пользователя',
  })
  email!: string;

  @ApiProperty({
    enum: Role,
    example: Role.USER,
    description: 'Глобальная роль пользователя',
  })
  globalRole!: Role;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Дата создания пользователя',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2024-01-20T14:45:00.000Z',
    description: 'Дата последнего обновления',
  })
  updatedAt!: Date;
}
