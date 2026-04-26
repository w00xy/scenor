import { ApiProperty } from '@nestjs/swagger';

export class DeleteNodeResponseDto {
  @ApiProperty({
    example: true,
    description: 'Результат удаления узла',
  })
  success!: boolean;

  @ApiProperty({
    example: 'Node deleted successfully',
    description: 'Сообщение об успешном удалении',
  })
  message!: string;
}
