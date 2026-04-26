import { ApiProperty } from '@nestjs/swagger';

export class DeleteWorkflowResponseDto {
  @ApiProperty({
    example: true,
    description: 'Результат удаления workflow',
  })
  success!: boolean;

  @ApiProperty({
    example: 'Workflow deleted successfully',
    description: 'Сообщение об успешном удалении',
  })
  message!: string;
}
