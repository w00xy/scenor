import { ApiProperty } from '@nestjs/swagger';

export class DeleteCredentialResponseDto {
  @ApiProperty({
    example: true,
    description: 'Результат удаления учётных данных',
  })
  success!: boolean;

  @ApiProperty({
    example: 'Credential deleted successfully',
    description: 'Сообщение об успешном удалении',
  })
  message!: string;
}
