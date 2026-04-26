import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { CredentialsService } from './credentials.service.js';
import { CreateCredentialDto, UpdateCredentialDto } from './dto/index.js';

type AuthenticatedRequest = Request & {
  user?: AuthTokenPayload;
};

@ApiTags('Учётные данные')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller()
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

  @Post('projects/:projectId/credentials')
  @ApiOperation({ summary: 'Создать учётные данные в проекте' })
  async createCredential(
    @Req() request: AuthenticatedRequest,
    @Param('projectId') projectId: string,
    @Body() data: CreateCredentialDto,
  ) {
    const userId = request.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }
    return this.credentialsService.createCredential(userId, projectId, data);
  }

  @Get('projects/:projectId/credentials')
  @ApiOperation({ summary: 'Получить список учётных данных в проекте' })
  async listCredentials(
    @Req() request: AuthenticatedRequest,
    @Param('projectId') projectId: string,
  ) {
    const userId = request.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }
    return this.credentialsService.listCredentialsByProject(userId, projectId);
  }

  @Get('credentials/:credentialId')
  @ApiOperation({ summary: 'Получить учётные данные по ID (без расшифрованных данных)' })
  async getCredential(
    @Req() request: AuthenticatedRequest,
    @Param('credentialId') credentialId: string,
  ) {
    const userId = request.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }
    return this.credentialsService.getCredentialById(userId, credentialId);
  }

  @Get('credentials/:credentialId/data')
  @ApiOperation({ summary: 'Получить учётные данные с расшифрованными данными (только для OWNER/EDITOR)' })
  async getCredentialWithData(
    @Req() request: AuthenticatedRequest,
    @Param('credentialId') credentialId: string,
  ) {
    const userId = request.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }
    return this.credentialsService.getCredentialWithData(userId, credentialId);
  }

  @Put('credentials/:credentialId')
  @ApiOperation({ summary: 'Обновить учётные данные' })
  async updateCredential(
    @Req() request: AuthenticatedRequest,
    @Param('credentialId') credentialId: string,
    @Body() data: UpdateCredentialDto,
  ) {
    const userId = request.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }
    return this.credentialsService.updateCredential(userId, credentialId, data);
  }

  @Delete('credentials/:credentialId')
  @ApiOperation({ summary: 'Удалить учётные данные' })
  async deleteCredential(
    @Req() request: AuthenticatedRequest,
    @Param('credentialId') credentialId: string,
  ) {
    const userId = request.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }
    return this.credentialsService.deleteCredential(userId, credentialId);
  }
}
