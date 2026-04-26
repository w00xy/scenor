import { ApiProperty } from '@nestjs/swagger';
import { ProjectResponseDto } from './project-response.dto.js';

export class ProjectsListResponseDto extends Array<ProjectResponseDto> {
  @ApiProperty({
    type: [ProjectResponseDto],
    description: 'Список проектов пользователя',
  })
  projects!: ProjectResponseDto[];
}
