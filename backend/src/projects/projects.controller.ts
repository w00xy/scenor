import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard.js';
import { AuthTokenPayload } from '../auth/auth-token.service.js';
import { CreateProjectDto, UpdateProjectDto } from './dto/index.js';
import { ProjectsService } from './projects.service.js';
import { ProjectResponseDto } from './dto/project-response.dto.js';
import { ProjectsListResponseDto } from './dto/projects-list-response.dto.js';
import { DeleteProjectResponseDto } from './dto/delete-project-response.dto.js';

type AuthenticatedRequest = Request & {
  user?: AuthTokenPayload;
};

@ApiTags('Проекты')
@Controller('projects')
@UseGuards(AuthGuard)
@ApiBearerAuth('access-token')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Создать проект' })
  @ApiResponse({ status: 201, description: 'Проект успешно создан', type: ProjectResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - требуется авторизация' })
  @ApiResponse({ status: 400, description: 'Bad Request - неверные данные' })
  async createProject(
    @Req() request: AuthenticatedRequest,
    @Body() data: CreateProjectDto,
  ) {
    const userId = request.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }

    return this.projectsService.createProject(userId, data);
  }

  @Get()
  @ApiOperation({ summary: 'Получить мои проекты' })
  @ApiResponse({ status: 200, description: 'Список проектов успешно получен', type: ProjectsListResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - требуется авторизация' })
  async getMyProjects(@Req() request: AuthenticatedRequest) {
    const userId = request.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }

    return this.projectsService.getMyProjects(userId);
  }

  @Get(':projectId')
  @ApiOperation({ summary: 'Получить проект по id' })
  @ApiResponse({ status: 200, description: 'Проект успешно получен', type: ProjectResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - требуется авторизация' })
  @ApiResponse({ status: 403, description: 'Forbidden - нет доступа к проекту' })
  @ApiResponse({ status: 404, description: 'Not Found - проект не найден' })
  async getProjectById(
    @Req() request: AuthenticatedRequest,
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
  ) {
    const userId = request.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }

    return this.projectsService.getProjectById(userId, projectId);
  }

  @Put(':projectId')
  @ApiOperation({ summary: 'Обновить проект по id' })
  @ApiResponse({ status: 200, description: 'Проект успешно обновлён', type: ProjectResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - требуется авторизация' })
  @ApiResponse({ status: 403, description: 'Forbidden - нет прав на редактирование проекта' })
  @ApiResponse({ status: 404, description: 'Not Found - проект не найден' })
  async updateProject(
    @Req() request: AuthenticatedRequest,
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Body() data: UpdateProjectDto,
  ) {
    const userId = request.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }

    return this.projectsService.updateProject(userId, projectId, data);
  }

  @Delete(':projectId')
  @ApiOperation({ summary: 'Удалить проект по id' })
  @ApiResponse({ status: 200, description: 'Проект успешно удалён', type: DeleteProjectResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - требуется авторизация' })
  @ApiResponse({ status: 403, description: 'Forbidden - нет прав на удаление проекта' })
  @ApiResponse({ status: 404, description: 'Not Found - проект не найден' })
  async deleteProject(
    @Req() request: AuthenticatedRequest,
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
  ) {
    const userId = request.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }

    return this.projectsService.deleteProject(userId, projectId);
  }

}

