import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { NodeTypesService } from './node-types.service.js';

@ApiTags('Типы узлов')
@Controller('node-types')
@UseGuards(AuthGuard)
@ApiBearerAuth('access-token')
export class NodeTypesController {
  constructor(private readonly nodeTypesService: NodeTypesService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список доступных типов узлов' })
  async listActiveNodeTypes() {
    return this.nodeTypesService.listActiveNodeTypes();
  }

  @Post('seed')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Инициализировать базовые типы узлов (только для администратора)' })
  async seedDefaultNodeTypes() {
    return this.nodeTypesService.seedDefaultNodeTypes();
  }
}

