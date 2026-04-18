import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard.js';
import { AuthTokenPayload } from '../auth/auth-token.service.js';
import { RunWorkflowManualDto } from './dto/index.js';
import { ExecutionsService } from './executions.service.js';

type AuthenticatedRequest = Request & {
  user?: AuthTokenPayload;
};

@Controller('workflows/:workflowId/executions')
@UseGuards(AuthGuard)
@ApiBearerAuth('access-token')
export class ExecutionsController {
  constructor(private readonly executionsService: ExecutionsService) {}

  @Post('manual')
  async runManual(
    @Req() request: AuthenticatedRequest,
    @Param('workflowId', new ParseUUIDPipe()) workflowId: string,
    @Body() data: RunWorkflowManualDto,
  ) {
    const userId = this.requireUserId(request);
    return this.executionsService.runManualWorkflow(
      userId,
      workflowId,
      data.inputDataJson,
    );
  }

  @Get()
  async listExecutions(
    @Req() request: AuthenticatedRequest,
    @Param('workflowId', new ParseUUIDPipe()) workflowId: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    const userId = this.requireUserId(request);
    return this.executionsService.listWorkflowExecutions(
      userId,
      workflowId,
      limit,
      offset,
    );
  }

  @Get(':executionId')
  async getExecution(
    @Req() request: AuthenticatedRequest,
    @Param('workflowId', new ParseUUIDPipe()) workflowId: string,
    @Param('executionId', new ParseUUIDPipe()) executionId: string,
  ) {
    const userId = this.requireUserId(request);
    return this.executionsService.getWorkflowExecution(
      userId,
      workflowId,
      executionId,
    );
  }

  @Get(':executionId/logs')
  async getExecutionLogs(
    @Req() request: AuthenticatedRequest,
    @Param('workflowId', new ParseUUIDPipe()) workflowId: string,
    @Param('executionId', new ParseUUIDPipe()) executionId: string,
    @Query('limit', new DefaultValuePipe(200), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    const userId = this.requireUserId(request);
    return this.executionsService.getExecutionLogs(
      userId,
      workflowId,
      executionId,
      limit,
      offset,
    );
  }

  private requireUserId(request: AuthenticatedRequest): string {
    const userId = request.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }
    return userId;
  }
}

