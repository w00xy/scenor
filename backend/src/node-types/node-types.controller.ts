import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { NodeTypesService } from './node-types.service.js';

@Controller('node-types')
@UseGuards(AuthGuard)
@ApiBearerAuth('access-token')
export class NodeTypesController {
  constructor(private readonly nodeTypesService: NodeTypesService) {}

  @Get()
  async listActiveNodeTypes() {
    return this.nodeTypesService.listActiveNodeTypes();
  }

  @Post('seed')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async seedDefaultNodeTypes() {
    return this.nodeTypesService.seedDefaultNodeTypes();
  }
}

