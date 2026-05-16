import {
  Controller,
  Get,
  Put,
  Delete,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard.js';
import { AdminGuard } from '../guards/admin.guard';
import { AdminProjectsService } from '../services/admin-projects.service';
import {
  GetProjectsQueryDto,
  UpdateProjectDto,
  TransferOwnershipDto,
} from '../dto/admin-projects.dto';

@Controller('admin/projects')
@UseGuards(AuthGuard, AdminGuard)
export class AdminProjectsController {
  constructor(private readonly adminProjectsService: AdminProjectsService) {}

  @Get()
  async getAllProjects(@Query() query: GetProjectsQueryDto) {
    return this.adminProjectsService.getAllProjects(query);
  }

  @Get(':id')
  async getProjectById(@Param('id') id: string) {
    return this.adminProjectsService.getProjectById(id);
  }

  @Put(':id')
  async updateProject(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Req() req: any,
  ) {
    const adminId = req.user.sub;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    return this.adminProjectsService.updateProject(
      id,
      updateProjectDto,
      adminId,
      ipAddress,
      userAgent,
    );
  }

  @Delete(':id')
  async deleteProject(@Param('id') id: string, @Req() req: any) {
    const adminId = req.user.sub;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    return this.adminProjectsService.deleteProject(
      id,
      adminId,
      ipAddress,
      userAgent,
    );
  }

  @Post(':id/transfer')
  async transferOwnership(
    @Param('id') id: string,
    @Body() transferDto: TransferOwnershipDto,
    @Req() req: any,
  ) {
    const adminId = req.user.sub;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    return this.adminProjectsService.transferOwnership(
      id,
      transferDto.newOwnerId,
      adminId,
      ipAddress,
      userAgent,
    );
  }

  @Get(':id/statistics')
  async getProjectStatistics(@Param('id') id: string) {
    return this.adminProjectsService.getProjectStatistics(id);
  }
}