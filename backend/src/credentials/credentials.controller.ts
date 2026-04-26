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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard.js';
import { AuthTokenPayload } from '../auth/auth-token.service.js';
import { CredentialsService } from './credentials.service.js';
import { CreateCredentialDto, UpdateCredentialDto } from './dto/index.js';
import { CredentialResponseDto } from './dto/credential-response.dto.js';
import { CredentialsListResponseDto } from './dto/credentials-list-response.dto.js';
import { CredentialWithDataResponseDto } from './dto/credential-with-data-response.dto.js';
import { DeleteCredentialResponseDto } from './dto/delete-credential-response.dto.js';

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
  @ApiResponse({ status: 201, description: 'Учётные данные успешно созданы', type: CredentialResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - требуется авторизация' })
  @ApiResponse({ status: 403, description: 'Forbidden - нет доступа к проекту' })
  @ApiResponse({ status: 404, description: 'Not Found - проект не найден' })
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
  @ApiResponse({ status: 200, description: 'Список учётных данных успешно получен', type: CredentialsListResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - требуется авторизация' })
  @ApiResponse({ status: 403, description: 'Forbidden - нет доступа к проекту' })
  @ApiResponse({ status: 404, description: 'Not Found - проект не найден' })
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
  @ApiResponse({ status: 200, description: 'Учётные данные успешно получены (без расшифрованных секретов)', type: CredentialResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - требуется авторизация' })
  @ApiResponse({ status: 403, description: 'Forbidden - нет доступа к учётным данным' })
  @ApiResponse({ status: 404, description: 'Not Found - учётные данные не найдены' })
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
  @ApiResponse({ status: 200, description: 'Учётные данные с расшифрованными секретами успешно получены', type: CredentialWithDataResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - требуется авторизация' })
  @ApiResponse({ status: 403, description: 'Forbidden - недостаточно прав (требуется роль OWNER или EDITOR)' })
  @ApiResponse({ status: 404, description: 'Not Found - учётные данные не найдены' })
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
  @ApiResponse({ status: 200, description: 'Учётные данные успешно обновлены', type: CredentialResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - требуется авторизация' })
  @ApiResponse({ status: 403, description: 'Forbidden - нет прав на редактирование учётных данных' })
  @ApiResponse({ status: 404, description: 'Not Found - учётные данные не найдены' })
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
  @ApiResponse({ status: 200, description: 'Учётные данные успешно удалены', type: DeleteCredentialResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - требуется авторизация' })
  @ApiResponse({ status: 403, description: 'Forbidden - нет прав на удаление учётных данных' })
  @ApiResponse({ status: 404, description: 'Not Found - учётные данные не найдены' })
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
