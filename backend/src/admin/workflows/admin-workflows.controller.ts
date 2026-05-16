import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard.js';
import { AdminGuard } from '../guards/admin.guard';
import { AdminWorkflowsService } from '../services/admin-workflows.service';
import { GetWorkflowsQueryDto } from '../dto/admin-workflows.dto';

@Controller('admin/workflows')
@UseGuards(AuthGuard, AdminGuard)
export class AdminWorkflowsController {
  constructor(
    private readonly adminWorkflowsService: AdminWorkflowsService,
  ) {}

  @Get()
  async getAllWorkflows(@Query() query: GetWorkflowsQueryDto) {
    return this.adminWorkflowsService.getAllWorkflows(query);
  }

  @Get(':id')
  async getWorkflowById(@Param('id') id: string) {
    return this.adminWorkflowsService.getWorkflowById(id);
  }

  @Delete(':id')
  async deleteWorkflow(@Param('id') id: string, @Req() req: any) {
    const adminId = req.user.sub;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    return this.adminWorkflowsService.deleteWorkflow(
      id,
      adminId,
      ipAddress,
      userAgent,
    );
  }

  @Get(':id/statistics')
  async getWorkflowStatistics(@Param('id') id: string) {
    return this.adminWorkflowsService.getWorkflowStatistics(id);
  }
}