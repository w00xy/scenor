import { ApiProperty } from '@nestjs/swagger';

export class DeleteEdgeResponseDto {
  @ApiProperty({
    example: true,
    description: 'Результат удаления связи',
  })
  success!: boolean;

  @ApiProperty({
    example: 'Edge deleted successfully',
    description: 'Сообщение об успешном удалении',
  })
  message!: string;
}
