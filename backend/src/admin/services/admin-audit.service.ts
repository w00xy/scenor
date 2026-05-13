import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export interface AdminAuditLogData {
  adminId: string;
  action: string;
  targetType: string;
  targetId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AdminAuditService {
  constructor(private readonly db: DatabaseService) {}

  async logAction(data: AdminAuditLogData) {
    return this.db.adminAuditLog.create({
      data: {
        adminId: data.adminId,
        action: data.action,
        targetType: data.targetType,
        targetId: data.targetId,
        details: data.details,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  async getAuditLogs(params: {
    limit?: number;
    offset?: number;
    action?: string;
    targetType?: string;
    adminId?: string;
  }) {
    const { limit = 50, offset = 0, action, targetType, adminId } = params;

    const where: any = {};
    if (action) where.action = action;
    if (targetType) where.targetType = targetType;
    if (adminId) where.adminId = adminId;

    const [logs, total] = await Promise.all([
      this.db.adminAuditLog.findMany({
        where,
        include: {
          admin: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.db.adminAuditLog.count({ where }),
    ]);

    return { logs, total };
  }
}
