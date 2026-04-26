import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard.js';
import { AuthTokenPayload } from '../auth/auth-token.service.js';
import { WorkflowSharesService } from './workflow-shares.service.js';
import { CreateWorkflowShareDto } from './dto/index.js';
import { WorkflowShareResponseDto } from './dto/workflow-share-response.dto.js';
import { WorkflowSharesListResponseDto } from './dto/workflow-shares-list-response.dto.js';
import { WorkflowByTokenResponseDto } from './dto/workflow-by-token-response.dto.js';
import { DeleteWorkflowShareResponseDto } from './dto/delete-workflow-share-response.dto.js';

type AuthenticatedRequest = Request & {
  user?: AuthTokenPayload;
};

@ApiTags('Workflow Shares')
@Controller()
export class WorkflowSharesController {
  constructor(private readonly workflowSharesService: WorkflowSharesService) {}

  @Post('workflows/:workflowId/shares')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Создать ссылку для общего доступа к workflow' })
  @ApiResponse({ status: 201, description: 'Ссылка для общего доступа успешно создана', type: WorkflowShareResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - требуется авторизация' })
  @ApiResponse({ status: 403, description: 'Forbidden - нет прав на создание ссылки для workflow' })
  @ApiResponse({ status: 404, description: 'Not Found - workflow не найден' })
  async createShare(
    @Req() request: AuthenticatedRequest,
    @Param('workflowId') workflowId: string,
    @Body() data: CreateWorkflowShareDto,
  ) {
    const userId = request.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }
    return this.workflowSharesService.createWorkflowShare(userId, workflowId, data);
  }

  @Get('workflows/:workflowId/shares')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Получить список всех ссылок общего доступа для workflow' })
  @ApiResponse({ status: 200, description: 'Список ссылок общего доступа успешно получен', type: WorkflowSharesListResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - требуется авторизация' })
  @ApiResponse({ status: 403, description: 'Forbidden - нет доступа к workflow' })
  @ApiResponse({ status: 404, description: 'Not Found - workflow не найден' })
  async listShares(
    @Req() request: AuthenticatedRequest,
    @Param('workflowId') workflowId: string,
  ) {
    const userId = request.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }
    return this.workflowSharesService.listWorkflowShares(userId, workflowId);
  }

  @Get('shares/:token')
  @ApiOperation({ summary: 'Получить workflow по токену общего доступа (публичный доступ)' })
  @ApiResponse({ status: 200, description: 'Workflow успешно получен по токену', type: WorkflowByTokenResponseDto })
  @ApiResponse({ status: 404, description: 'Not Found - ссылка не найдена или истекла' })
  async getWorkflowByToken(@Param('token') token: string) {
    return this.workflowSharesService.getWorkflowByToken(token);
  }

  @Delete('shares/:shareId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Удалить ссылку общего доступа' })
  @ApiResponse({ status: 200, description: 'Ссылка общего доступа успешно удалена', type: DeleteWorkflowShareResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - требуется авторизация' })
  @ApiResponse({ status: 403, description: 'Forbidden - нет прав на удаление ссылки' })
  @ApiResponse({ status: 404, description: 'Not Found - ссылка не найдена' })
  async deleteShare(
    @Req() request: AuthenticatedRequest,
    @Param('shareId') shareId: string,
  ) {
    const userId = request.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }
    return this.workflowSharesService.deleteWorkflowShare(userId, shareId);
  }
}
