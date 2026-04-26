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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard.js';
import { AuthTokenPayload } from '../auth/auth-token.service.js';
import { WorkflowSharesService } from './workflow-shares.service.js';
import { CreateWorkflowShareDto } from './dto/index.js';

type AuthenticatedRequest = Request & {
  user?: AuthTokenPayload;
};

@ApiTags('Общий доступ к Workflow')
@Controller()
export class WorkflowSharesController {
  constructor(private readonly workflowSharesService: WorkflowSharesService) {}

  @Post('workflows/:workflowId/shares')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Создать ссылку для общего доступа к workflow' })
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
  async getWorkflowByToken(@Param('token') token: string) {
    return this.workflowSharesService.getWorkflowByToken(token);
  }

  @Delete('shares/:shareId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Удалить ссылку общего доступа' })
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
