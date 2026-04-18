import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard.js';
import { AuthTokenPayload } from '../auth/auth-token.service.js';
import { CreateProjectDto, UpdateProjectDto } from './dto/index.js';
import { ProjectsService } from './projects.service.js';
import { ApiOperation } from '@nestjs/swagger';

type AuthenticatedRequest = Request & {
  user?: AuthTokenPayload;
};

@Controller('projects')
@UseGuards(AuthGuard)
@ApiBearerAuth('access-token')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Создать проект' })
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
  async getMyProjects(@Req() request: AuthenticatedRequest) {
    const userId = request.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }

    return this.projectsService.getMyProjects(userId);
  }

  @Get(':projectId')
  @ApiOperation({ summary: 'Получить проект по id' })
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
}

