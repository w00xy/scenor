import { ApiProperty } from '@nestjs/swagger';
import { WorkflowResponseDto } from '../../workflows/dto/workflow-response.dto.js';

export class WorkflowByTokenResponseDto {
  @ApiProperty({
    type: WorkflowResponseDto,
    description: 'Информация о workflow',
  })
  workflow!: WorkflowResponseDto;

  @ApiProperty({
    example: true,
    description: 'Доступен ли workflow по токену',
  })
  isAccessible!: boolean;
}
