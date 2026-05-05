import { ApiProperty } from '@nestjs/swagger';

export class DeleteExecutionResponseDto {
  @ApiProperty({
    description: 'Успешность операции',
    example: true,
  })
  success?: boolean;

  @ApiProperty({
    description: 'Сообщение о результате',
    example: 'Execution deleted successfully',
  })
  message?: string;

  @ApiProperty({
    description: 'ID удаленного выполнения',
    example: '987fcdeb-51a2-43f7-8b9c-123456789abc',
  })
  deletedExecutionId: string;

  @ApiProperty({
    description: 'Количество удаленных логов узлов',
    example: 15,
  })
  deletedLogsCount: number;

  @ApiProperty({
    description: 'ID записи аудита',
    example: 'abc12345-6789-0def-1234-567890abcdef',
  })
  auditId: string;
}
