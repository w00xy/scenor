import { ApiProperty } from '@nestjs/swagger';

export class DeleteProjectResponseDto {
  @ApiProperty({
    example: true,
    description: 'Результат удаления проекта',
  })
  success!: boolean;

  @ApiProperty({
    example: 'Project deleted successfully',
    description: 'Сообщение об успешном удалении',
  })
  message!: string;
}
