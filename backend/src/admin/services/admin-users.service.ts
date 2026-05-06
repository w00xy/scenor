import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AdminAuditService } from './admin-audit.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly db: DatabaseService,
    private readonly auditService: AdminAuditService,
  ) {}

  async getAllUsers(params: {
    limit?: number;
    offset?: number;
    search?: string;
    role?: string;
    isBlocked?: boolean;
  }) {
    const { limit = 50, offset = 0, search, role, isBlocked } = params;

    const where: any = {};

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isBlocked !== undefined) {
      where.isBlocked = isBlocked;
    }

    const [users, total] = await Promise.all([
      this.db.user.findMany({
        where,
        include: {
          profile: true,
          _count: {
            select: {
              projects: true,
              createdWorkflows: true,
              startedExecutions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.db.user.count({ where }),
    ]);

    // Remove password hash from response
    const sanitizedUsers = users.map((user) => {
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return { users: sanitizedUsers, total };
  }

  async getUserById(userId: string) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        _count: {
          select: {
            projects: true,
            memberships: true,
            createdWorkflows: true,
            startedExecutions: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUser(
    userId: string,
    data: {
      username?: string;
      email?: string;
      role?: 'USER' | 'SUPER_ADMIN';
    },
    adminId: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const user = await this.db.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.db.user.update({
      where: { id: userId },
      data: {
        ...(data.username && { username: data.username }),
        ...(data.email && { email: data.email }),
        ...(data.role && { role: data.role }),
      },
    });

    // Log the action
    await this.auditService.logAction({
      adminId,
      action: 'USER_UPDATE',
      targetType: 'USER',
      targetId: userId,
      details: { changes: data },
      ipAddress,
      userAgent,
    });

    const { passwordHash, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async blockUser(
    userId: string,
    adminId: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const user = await this.db.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.db.user.update({
      where: { id: userId },
      data: { isBlocked: true },
    });

    await this.auditService.logAction({
      adminId,
      action: 'USER_BLOCK',
      targetType: 'USER',
      targetId: userId,
      ipAddress,
      userAgent,
    });

    const { passwordHash, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async unblockUser(
    userId: string,
    adminId: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const user = await this.db.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.db.user.update({
      where: { id: userId },
      data: { isBlocked: false },
    });

    await this.auditService.logAction({
      adminId,
      action: 'USER_UNBLOCK',
      targetType: 'USER',
      targetId: userId,
      ipAddress,
      userAgent,
    });

    const { passwordHash, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async deleteUser(
    userId: string,
    adminId: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const user = await this.db.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.db.user.delete({ where: { id: userId } });

    await this.auditService.logAction({
      adminId,
      action: 'USER_DELETE',
      targetType: 'USER',
      targetId: userId,
      details: { email: user.email, username: user.username },
      ipAddress,
      userAgent,
    });

    return { message: 'User deleted successfully' };
  }

  async resetPassword(
    userId: string,
    newPassword: string,
    adminId: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const user = await this.db.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.db.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    await this.auditService.logAction({
      adminId,
      action: 'USER_PASSWORD_RESET',
      targetType: 'USER',
      targetId: userId,
      ipAddress,
      userAgent,
    });

    return { message: 'Password reset successfully' };
  }

  async getUserActivity(userId: string, limit = 50, offset = 0) {
    const [activities, total] = await Promise.all([
      this.db.userActivityLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.db.userActivityLog.count({ where: { userId } }),
    ]);

    return { activities, total };
  }
}
