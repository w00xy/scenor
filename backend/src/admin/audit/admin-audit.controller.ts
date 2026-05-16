import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard.js';
import { AdminGuard } from '../guards/admin.guard';
import { AdminAuditService } from '../services/admin-audit.service';
import { GetAuditLogsDto } from '../dto/admin-audit.dto';

@Controller('admin/audit')
@UseGuards(AuthGuard, AdminGuard)
export class AdminAuditController {
  constructor(private readonly adminAuditService: AdminAuditService) {}

  @Get('logs')
  async getAuditLogs(@Query() query: GetAuditLogsDto) {
    return this.adminAuditService.getAuditLogs(query);
  }
}