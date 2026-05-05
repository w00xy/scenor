import { ApiProperty } from '@nestjs/swagger';
import { ProjectResponseDto } from './project-response.dto.js';

export class ProjectsListResponseDto {
  @ApiProperty({
    type: [ProjectResponseDto],
    description: 'Список проектов пользователя',
  })
  projects!: ProjectResponseDto[];
}
