import { ApiProperty } from '@nestjs/swagger';

export class DeleteUserResponseDto {
  @ApiProperty({
    example: true,
    description: 'Результат удаления пользователя',
  })
  success!: boolean;

  @ApiProperty({
    example: 'User deleted successfully',
    description: 'Сообщение об успешном удалении',
  })
  message!: string;
}
