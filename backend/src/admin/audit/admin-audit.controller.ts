import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard.js';
import { AdminGuard } from '../guards/admin.guard.js';
import { AdminAuditService } from '../services/admin-audit.service.js';
import { GetAuditLogsDto } from '../dto/admin-audit.dto.js';

@Controller('admin/audit')
@UseGuards(AuthGuard, AdminGuard)
export class AdminAuditController {
  constructor(private readonly adminAuditService: AdminAuditService) {}

  @Get('logs')
  async getAuditLogs(@Query() query: GetAuditLogsDto) {
    return this.adminAuditService.getAuditLogs(query);
  }
}
