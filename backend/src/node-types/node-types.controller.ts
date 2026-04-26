import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { NodeTypesService } from './node-types.service.js';
import { NodeTypesListResponseDto } from './dto/node-types-list-response.dto.js';
import { SeedNodeTypesResponseDto } from './dto/seed-node-types-response.dto.js';

@ApiTags('Типы узлов')
@Controller('node-types')
@UseGuards(AuthGuard)
@ApiBearerAuth('access-token')
export class NodeTypesController {
  constructor(private readonly nodeTypesService: NodeTypesService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список доступных типов узлов' })
  @ApiResponse({ status: 200, description: 'Список типов узлов успешно получен', type: NodeTypesListResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - требуется авторизация' })
  async listActiveNodeTypes() {
    return this.nodeTypesService.listActiveNodeTypes();
  }

  @Post('seed')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Инициализировать базовые типы узлов (только для администратора)' })
  @ApiResponse({ status: 201, description: 'Базовые типы узлов успешно инициализированы', type: SeedNodeTypesResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - требуется авторизация' })
  @ApiResponse({ status: 403, description: 'Forbidden - недостаточно прав (требуется роль SUPER_ADMIN)' })
  async seedDefaultNodeTypes() {
    return this.nodeTypesService.seedDefaultNodeTypes();
  }
}

