import { ApiProperty } from '@nestjs/swagger';

export class PasswordCheckResponseDto {
  @ApiProperty({
    example: true,
    description:
      'Результат проверки пароля (true - пароль верный, false - неверный)',
  })
  isValid!: boolean;
}
