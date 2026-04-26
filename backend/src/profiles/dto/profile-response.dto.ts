import { ApiProperty } from '@nestjs/swagger';

export class ProfileResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Уникальный идентификатор профиля',
  })
  id!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID пользователя',
  })
  userId!: string;

  @ApiProperty({
    example: 'Alex',
    description: 'Имя пользователя',
    nullable: true,
  })
  firstName!: string | null;

  @ApiProperty({
    example: 'Johnson',
    description: 'Фамилия пользователя',
    nullable: true,
  })
  lastName!: string | null;

  @ApiProperty({
    example: '+1234567890',
    description: 'Номер телефона',
    nullable: true,
  })
  phone!: string | null;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'URL аватара пользователя',
    nullable: true,
  })
  avatarUrl!: string | null;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Дата создания профиля',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2024-01-20T14:45:00.000Z',
    description: 'Дата последнего обновления',
  })
  updatedAt!: Date;
}
