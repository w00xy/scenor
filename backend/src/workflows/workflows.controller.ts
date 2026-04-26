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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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
  async listWorkflowsByProject(
    @Req() request: AuthenticatedRequest,
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
  ) {
    const userId = this.requireUserId(request);
    return this.workflowsService.listWorkflowsByProject(userId, projectId);
  }

  @Get('workflows/:workflowId')
  @ApiOperation({ summary: 'Получить workflow по ID' })
  async getWorkflowById(
    @Req() request: AuthenticatedRequest,
    @Param('workflowId', new ParseUUIDPipe()) workflowId: string,
  ) {
    const userId = this.requireUserId(request);
    return this.workflowsService.getWorkflowById(userId, workflowId);
  }

  @Put('workflows/:workflowId')
  @ApiOperation({ summary: 'Обновить workflow' })
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
  async deleteWorkflow(
    @Req() request: AuthenticatedRequest,
    @Param('workflowId', new ParseUUIDPipe()) workflowId: string,
  ) {
    const userId = this.requireUserId(request);
    return this.workflowsService.deleteWorkflow(userId, workflowId);
  }

  @Get('workflows/:workflowId/graph')
  @ApiOperation({ summary: 'Получить граф workflow (узлы и связи)' })
  async getWorkflowGraph(
    @Req() request: AuthenticatedRequest,
    @Param('workflowId', new ParseUUIDPipe()) workflowId: string,
  ) {
    const userId = this.requireUserId(request);
    return this.workflowsService.getWorkflowGraph(userId, workflowId);
  }

  @Post('workflows/:workflowId/nodes')
  @ApiOperation({ summary: 'Создать узел в workflow' })
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

