import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto.js';

export class UsersListResponseDto {
  @ApiProperty({
    type: [UserResponseDto],
    description: 'Список пользователей',
  })
  users!: UserResponseDto[];

  @ApiProperty({
    example: 150,
    description: 'Общее количество пользователей',
  })
  total!: number;
}
