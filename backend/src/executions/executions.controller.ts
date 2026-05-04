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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard.js';
import { AuthTokenPayload } from '../auth/auth-token.service.js';
import { RunWorkflowManualDto } from './dto/index.js';
import { ExecutionsService } from './executions.service.js';
import { ExecutionResponseDto } from './dto/execution-response.dto.js';
import { ExecutionsListResponseDto } from './dto/executions-list-response.dto.js';
import { ExecutionLogsListResponseDto } from './dto/execution-logs-list-response.dto.js';

type AuthenticatedRequest = Request & {
  user?: AuthTokenPayload;
};

@ApiTags('Выполнение Workflow')
@Controller('workflows/:workflowId/executions')
@UseGuards(AuthGuard)
@ApiBearerAuth('access-token')
export class ExecutionsController {
  constructor(private readonly executionsService: ExecutionsService) {}

  @Post('manual')
  @ApiOperation({ summary: 'Запустить workflow вручную' })
  @ApiResponse({ status: 201, description: 'Workflow успешно запущен, возвращает информацию о выполнении', type: ExecutionResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - требуется авторизация' })
  @ApiResponse({ status: 403, description: 'Forbidden - нет доступа к workflow' })
  @ApiResponse({ status: 404, description: 'Not Found - workflow не найден' })
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

  @Post('webhook/:webhookToken')
  @ApiOperation({ summary: 'Запустить workflow через webhook' })
  @ApiResponse({ status: 201, description: 'Workflow успешно запущен через webhook', type: ExecutionResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request - неверные данные' })
  @ApiResponse({ status: 404, description: 'Not Found - workflow или webhook не найден' })
  async runWebhook(
    @Param('workflowId', new ParseUUIDPipe()) workflowId: string,
    @Param('webhookToken') webhookToken: string,
    @Body() data?: Record<string, unknown>,
  ) {
    return this.executionsService.runWebhookWorkflow(
      workflowId,
      webhookToken,
      data ?? {},
    );
  }

  @Get()
  @ApiOperation({ summary: 'Получить список выполнений workflow' })
  @ApiResponse({ status: 200, description: 'Список выполнений успешно получен', type: ExecutionsListResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - требуется авторизация' })
  @ApiResponse({ status: 403, description: 'Forbidden - нет доступа к workflow' })
  @ApiResponse({ status: 404, description: 'Not Found - workflow не найден' })
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
  @ApiOperation({ summary: 'Получить детали выполнения workflow' })
  @ApiResponse({ status: 200, description: 'Детали выполнения успешно получены', type: ExecutionResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - требуется авторизация' })
  @ApiResponse({ status: 403, description: 'Forbidden - нет доступа к workflow' })
  @ApiResponse({ status: 404, description: 'Not Found - выполнение или workflow не найден' })
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
  @ApiOperation({ summary: 'Получить логи выполнения узлов workflow' })
  @ApiResponse({ status: 200, description: 'Логи выполнения успешно получены', type: ExecutionLogsListResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - требуется авторизация' })
  @ApiResponse({ status: 403, description: 'Forbidden - нет доступа к workflow' })
  @ApiResponse({ status: 404, description: 'Not Found - выполнение или workflow не найден' })
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

