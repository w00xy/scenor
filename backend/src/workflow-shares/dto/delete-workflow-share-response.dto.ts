import { ApiProperty } from '@nestjs/swagger';

export class DeleteWorkflowShareResponseDto {
  @ApiProperty({
    example: true,
    description: 'Результат удаления ссылки общего доступа',
  })
  success!: boolean;

  @ApiProperty({
    example: 'Workflow share deleted successfully',
    description: 'Сообщение об успешном удалении',
  })
  message!: string;
}
