import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordResponseDto {
  @ApiProperty({
    example: true,
    description: 'Результат изменения пароля',
  })
  success!: boolean;

  @ApiProperty({
    example: 'Password changed successfully',
    description: 'Сообщение об успешном изменении пароля',
  })
  message!: string;
}
