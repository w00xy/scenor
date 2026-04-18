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
import { ApiBearerAuth } from '@nestjs/swagger';
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

@Controller()
@UseGuards(AuthGuard)
@ApiBearerAuth('access-token')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Post('projects/:projectId/workflows')
  async createWorkflow(
    @Req() request: AuthenticatedRequest,
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Body() data: CreateWorkflowDto,
  ) {
    const userId = this.requireUserId(request);
    return this.workflowsService.createWorkflow(userId, projectId, data);
  }

  @Get('projects/:projectId/workflows')
  async listWorkflowsByProject(
    @Req() request: AuthenticatedRequest,
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
  ) {
    const userId = this.requireUserId(request);
    return this.workflowsService.listWorkflowsByProject(userId, projectId);
  }

  @Get('workflows/:workflowId')
  async getWorkflowById(
    @Req() request: AuthenticatedRequest,
    @Param('workflowId', new ParseUUIDPipe()) workflowId: string,
  ) {
    const userId = this.requireUserId(request);
    return this.workflowsService.getWorkflowById(userId, workflowId);
  }

  @Put('workflows/:workflowId')
  async updateWorkflow(
    @Req() request: AuthenticatedRequest,
    @Param('workflowId', new ParseUUIDPipe()) workflowId: string,
    @Body() data: UpdateWorkflowDto,
  ) {
    const userId = this.requireUserId(request);
    return this.workflowsService.updateWorkflow(userId, workflowId, data);
  }

  @Delete('workflows/:workflowId')
  async deleteWorkflow(
    @Req() request: AuthenticatedRequest,
    @Param('workflowId', new ParseUUIDPipe()) workflowId: string,
  ) {
    const userId = this.requireUserId(request);
    return this.workflowsService.deleteWorkflow(userId, workflowId);
  }

  @Get('workflows/:workflowId/graph')
  async getWorkflowGraph(
    @Req() request: AuthenticatedRequest,
    @Param('workflowId', new ParseUUIDPipe()) workflowId: string,
  ) {
    const userId = this.requireUserId(request);
    return this.workflowsService.getWorkflowGraph(userId, workflowId);
  }

  @Post('workflows/:workflowId/nodes')
  async createNode(
    @Req() request: AuthenticatedRequest,
    @Param('workflowId', new ParseUUIDPipe()) workflowId: string,
    @Body() data: CreateWorkflowNodeDto,
  ) {
    const userId = this.requireUserId(request);
    return this.workflowsService.createNode(userId, workflowId, data);
  }

  @Put('workflows/:workflowId/nodes/:nodeId')
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
  async deleteNode(
    @Req() request: AuthenticatedRequest,
    @Param('workflowId', new ParseUUIDPipe()) workflowId: string,
    @Param('nodeId', new ParseUUIDPipe()) nodeId: string,
  ) {
    const userId = this.requireUserId(request);
    return this.workflowsService.deleteNode(userId, workflowId, nodeId);
  }

  @Post('workflows/:workflowId/edges')
  async createEdge(
    @Req() request: AuthenticatedRequest,
    @Param('workflowId', new ParseUUIDPipe()) workflowId: string,
    @Body() data: CreateWorkflowEdgeDto,
  ) {
    const userId = this.requireUserId(request);
    return this.workflowsService.createEdge(userId, workflowId, data);
  }

  @Put('workflows/:workflowId/edges/:edgeId')
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

