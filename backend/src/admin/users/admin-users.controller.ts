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
import { AdminGuard } from '../guards/admin.guard.js';
import { AdminUsersService } from '../services/admin-users.service.js';
import {
  GetUsersQueryDto,
  UpdateUserDto,
  ResetPasswordDto,
} from '../dto/admin-users.dto.js';

@Controller('admin/users')
@UseGuards(AuthGuard, AdminGuard)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  async getAllUsers(@Query() query: GetUsersQueryDto) {
    return this.adminUsersService.getAllUsers(query);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.adminUsersService.getUserById(id);
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: any,
  ) {
    const adminId = req.user.id;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    return this.adminUsersService.updateUser(
      id,
      updateUserDto,
      adminId,
      ipAddress,
      userAgent,
    );
  }

  @Post(':id/block')
  async blockUser(@Param('id') id: string, @Req() req: any) {
    const adminId = req.user.sub;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    return this.adminUsersService.blockUser(id, adminId, ipAddress, userAgent);
  }

  @Post(':id/unblock')
  async unblockUser(@Param('id') id: string, @Req() req: any) {
    const adminId = req.user.sub;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    return this.adminUsersService.unblockUser(
      id,
      adminId,
      ipAddress,
      userAgent,
    );
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string, @Req() req: any) {
    const adminId = req.user.id;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    return this.adminUsersService.deleteUser(
      id,
      adminId,
      ipAddress,
      userAgent,
    );
  }

  @Post(':id/reset-password')
  async resetPassword(
    @Param('id') id: string,
    @Body() resetPasswordDto: ResetPasswordDto,
    @Req() req: any,
  ) {
    const adminId = req.user.id;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    return this.adminUsersService.resetPassword(
      id,
      resetPasswordDto.newPassword,
      adminId,
      ipAddress,
      userAgent,
    );
  }

  @Get(':id/activity')
  async getUserActivity(
    @Param('id') id: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.adminUsersService.getUserActivity(id, limit, offset);
  }
}
