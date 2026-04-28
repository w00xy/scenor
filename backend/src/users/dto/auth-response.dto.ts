import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto.js';

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access токен для авторизации',
  })
  accessToken!: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT refresh токен для обновления access токена',
  })
  refreshToken!: string;

  @ApiProperty({
    type: UserResponseDto,
    description: 'Информация о пользователе',
  })
  user!: UserResponseDto;
}
