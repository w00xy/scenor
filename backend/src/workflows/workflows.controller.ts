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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard.js';
import { AuthTokenPayload } from '../auth/auth-token.service.js';
import {
  CreateWorkflowDto,
  CreateWorkflowEdgeDto,
  CreateWorkflowNodeDto,
  UpdateWorkflowDto,
  UpdateWorkflowEdgeDto,
  UpdateWorkflowNodeDto,
} from './dto/index.js';
import { WorkflowsService } from './workflows.service.js';
import { WorkflowResponseDto } from './dto/workflow-response.dto.js';
import { WorkflowsListResponseDto } from './dto/workflows-list-response.dto.js';
import { WorkflowGraphResponseDto } from './dto/workflow-graph-response.dto.js';
import { WorkflowNodeResponseDto } from './dto/workflow-node-response.dto.js';
import { WorkflowEdgeResponseDto } from './dto/workflow-edge-response.dto.js';
import { DeleteWorkflowResponseDto } from './dto/delete-workflow-response.dto.js';
import { DeleteNodeResponseDto } from './dto/delete-node-response.dto.js';
import { DeleteEdgeResponseDto } from './dto/delete-edge-response.dto.js';

type AuthenticatedRequest = Request & {
  user?: AuthTokenPayload;
};

@ApiTags('Workflow')
@Controller()
@UseGuards(AuthGuard)
@ApiBearerAuth('access-token')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Post('projects/:projectId/workflows')
  @ApiOperation({ summary: 'Создать новый workflow в проекте' })
  @ApiResponse({
    status: 201,
    description: 'Workflow успешно создан',
    type: WorkflowResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - требуется авторизация',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - нет доступа к проекту',
  })
  @ApiResponse({ status: 404, description: 'Not Found - проект не найден' })
  async createWorkflow(
    @Req() request: AuthenticatedRequest,
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Body() data: CreateWorkflowDto,
  ) {
    const userId = this.requireUserId(request);
    return this.workflowsService.createWorkflow(userId, projectId, data);
  }

  @Get('projects/:projectId/workflows')
  @ApiOperation({ summary: 'Получить список всех workflow в проекте' })
  @ApiResponse({
    status: 200,
    description: 'Список workflow успешно получен',
    type: WorkflowsListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - требуется авторизация',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - нет доступа к проекту',
  })
  @ApiResponse({ status: 404, description: 'Not Found - проект не найден' })
  async listWorkflowsByProject(
    @Req() request: AuthenticatedRequest,
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
  ) {
    const userId = this.requireUserId(request);
    return this.workflowsService.listWorkflowsByProject(userId, projectId);
  }

  @Get('workflows/:workflowId')
  @ApiOperation({ summary: 'Получить workflow по ID' })
  @ApiResponse({
    status: 200,
    description: 'Workflow успешно получен',
    type: WorkflowResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - требуется авторизация',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - нет доступа к workflow',
  })
  @ApiResponse({ status: 404, description: 'Not Found - workflow не найден' })
  async getWorkflowById(
    @Req() request: AuthenticatedRequest,
    @Param('workflowId', new ParseUUIDPipe()) workflowId: string,
  ) {
    const userId = this.requireUserId(request);
    return this.workflowsService.getWorkflowById(userId, workflowId);
  }

  @Put('workflows/:workflowId')
  @ApiOperation({ summary: 'Обновить workflow' })
  @ApiResponse({
    status: 200,
    description: 'Workflow успешно обновлён',
    type: WorkflowResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - требуется авторизация',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - нет прав на редактирование workflow',
  })
  @ApiResponse({ status: 404, description: 'Not Found - workflow не найден' })
  async updateWorkflow(
    @Req() request: AuthenticatedRequest,
    @Param('workflowId', new ParseUUIDPipe()) workflowId: string,
    @Body() data: UpdateWorkflowDto,
  ) {
    const userId = this.requireUserId(request);
    return this.workflowsService.updateWorkflow(userId, workflowId, data);
  }

  @Delete('workflows/:workflowId')
  @ApiOperation({ summary: 'Удалить workflow' })
  @ApiResponse({
    status: 200,
    description: 'Workflow успешно удалён',
    type: DeleteWorkflowResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - требуется авторизация',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - нет прав на удаление workflow',
  })
  @ApiResponse({ status: 404, description: 'Not Found - workflow не найден' })
  async deleteWorkflow(
    @Req() request: AuthenticatedRequest,
    @Param('workflowId', new ParseUUIDPipe()) workflowId: string,
  ) {
    const userId = this.requireUserId(request);
    return this.workflowsService.deleteWorkflow(userId, workflowId);
  }

  @Get('workflows/:workflowId/graph')
  @ApiOperation({ summary: 'Получить граф workflow (узлы и связи)' })
  @ApiResponse({
    status: 200,
    description: 'Граф workflow успешно получен',
    type: WorkflowGraphResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - требуется авторизация',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - нет доступа к workflow',
  })
  @ApiResponse({ status: 404, description: 'Not Found - workflow не найден' })
  async getWorkflowGraph(
    @Req() request: AuthenticatedRequest,
    @Param('workflowId', new ParseUUIDPipe()) workflowId: string,
  ) {
    const userId = this.requireUserId(request);
    return this.workflowsService.getWorkflowGraph(userId, workflowId);
  }

  @Post('workflows/:workflowId/nodes')
  @ApiOperation({ summary: 'Создать узел в workflow' })
  @ApiResponse({
    status: 201,
    description: 'Узел успешно создан',
    type: WorkflowNodeResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - требуется авторизация',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - нет прав на редактирование workflow',
  })
  @ApiResponse({ status: 404, description: 'Not Found - workflow не найден' })
  async createNode(
    @Req() request: AuthenticatedRequest,
    @Param('workflowId', new ParseUUIDPipe()) workflowId: string,
    @Body() data: CreateWorkflowNodeDto,
  ) {
    const userId = this.requireUserId(request);
    return this.workflowsService.createNode(userId, workflowId, data);
  }

  @Put('workflows/:workflowId/nodes/:nodeId')
  @ApiOperation({ summary: 'Обновить узел в workflow' })
  @ApiResponse({
    status: 200,
    description: 'Узел успешно обновлён',
    type: WorkflowNodeResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - требуется авторизация',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - нет прав на редактирование workflow',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - узел или workflow не найден',
  })
  async updateNode(
    @Req() request: AuthenticatedRequest,
    @Param('workflowId', new ParseUUIDPipe()) workflowId: string,
    @Param('nodeId', new ParseUUIDPipe()) nodeId: string,
    @Body() data: UpdateWorkflowNodeDto,
  ) {
    const userId = this.requireUserId(request);
    return this.workflowsService.updateNode(userId, workflowId, nodeId, data);
  }

  @Delete('workflows/:workflowId/nodes/:nodeId')
  @ApiOperation({ summary: 'Удалить узел из workflow' })
  @ApiResponse({
    status: 200,
    description: 'Узел успешно удалён',
    type: DeleteNodeResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - требуется авторизация',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - нет прав на редактирование workflow',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - узел или workflow не найден',
  })
  async deleteNode(
    @Req() request: AuthenticatedRequest,
    @Param('workflowId', new ParseUUIDPipe()) workflowId: string,
    @Param('nodeId', new ParseUUIDPipe()) nodeId: string,
  ) {
    const userId = this.requireUserId(request);
    return this.workflowsService.deleteNode(userId, workflowId, nodeId);
  }

  @Post('workflows/:workflowId/edges')
  @ApiOperation({ summary: 'Создать связь между узлами в workflow' })
  @ApiResponse({
    status: 201,
    description: 'Связь успешно создана',
    type: WorkflowEdgeResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - требуется авторизация',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - нет прав на редактирование workflow',
  })
  @ApiResponse({ status: 404, description: 'Not Found - workflow не найден' })
  async createEdge(
    @Req() request: AuthenticatedRequest,
    @Param('workflowId', new ParseUUIDPipe()) workflowId: string,
    @Body() data: CreateWorkflowEdgeDto,
  ) {
    const userId = this.requireUserId(request);
    return this.workflowsService.createEdge(userId, workflowId, data);
  }

  @Put('workflows/:workflowId/edges/:edgeId')
  @ApiOperation({ summary: 'Обновить связь между узлами' })
  @ApiResponse({
    status: 200,
    description: 'Связь успешно обновлена',
    type: WorkflowEdgeResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - требуется авторизация',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - нет прав на редактирование workflow',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - связь или workflow не найден',
  })
  async updateEdge(
    @Req() request: AuthenticatedRequest,
    @Param('workflowId', new ParseUUIDPipe()) workflowId: string,
    @Param('edgeId', new ParseUUIDPipe()) edgeId: string,
    @Body() data: UpdateWorkflowEdgeDto,
  ) {
    const userId = this.requireUserId(request);
    return this.workflowsService.updateEdge(userId, workflowId, edgeId, data);
  }

  @Delete('workflows/:workflowId/edges/:edgeId')
  @ApiOperation({ summary: 'Удалить связь между узлами' })
  @ApiResponse({
    status: 200,
    description: 'Связь успешно удалена',
    type: DeleteEdgeResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - требуется авторизация',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - нет прав на редактирование workflow',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - связь или workflow не найден',
  })
  async deleteEdge(
    @Req() request: AuthenticatedRequest,
    @Param('workflowId', new ParseUUIDPipe()) workflowId: string,
    @Param('edgeId', new ParseUUIDPipe()) edgeId: string,
  ) {
    const userId = this.requireUserId(request);
    return this.workflowsService.deleteEdge(userId, workflowId, edgeId);
  }

  private requireUserId(request: AuthenticatedRequest): string {
    const userId = request.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }
    return userId;
  }
}
