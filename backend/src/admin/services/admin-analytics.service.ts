import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class AdminAnalyticsService {
  constructor(private readonly db: DatabaseService) {}

  async getPlatformStatistics() {
    const [
      totalUsers,
      totalProjects,
      totalWorkflows,
      totalExecutions,
      activeUsers,
      blockedUsers,
    ] = await Promise.all([
      this.db.user.count(),
      this.db.project.count(),
      this.db.workflow.count(),
      this.db.workflowExecution.count(),
      this.db.user.count({ where: { isBlocked: false } }),
      this.db.user.count({ where: { isBlocked: true } }),
    ]);

    const workflowsByStatus = await this.db.workflow.groupBy({
      by: ['status'],
      _count: true,
    });

    const executionsByStatus = await this.db.workflowExecution.groupBy({
      by: ['status'],
      _count: true,
    });

    const projectsByType = await this.db.project.groupBy({
      by: ['type'],
      _count: true,
    });

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        blocked: blockedUsers,
      },
      projects: {
        total: totalProjects,
        byType: projectsByType,
      },
      workflows: {
        total: totalWorkflows,
        byStatus: workflowsByStatus,
      },
      executions: {
        total: totalExecutions,
        byStatus: executionsByStatus,
      },
    };
  }

  async getExecutionAnalytics(params: {
    startDate?: Date;
    endDate?: Date;
  }) {
    const { startDate, endDate } = params;

    const where: any = {};
    if (startDate || endDate) {
      where.startedAt = {};
      if (startDate) where.startedAt.gte = startDate;
      if (endDate) where.startedAt.lte = endDate;
    }

    const [totalExecutions, executionsByStatus, avgExecutionTime] =
      await Promise.all([
        this.db.workflowExecution.count({ where }),
        this.db.workflowExecution.groupBy({
          by: ['status'],
          where,
          _count: true,
        }),
        this.db.$queryRaw<Array<{ avg_duration: number | null }>>`
          SELECT AVG(EXTRACT(EPOCH FROM (finished_at - started_at))) as avg_duration
          FROM workflow_executions
          WHERE started_at IS NOT NULL 
            AND finished_at IS NOT NULL
            AND status = 'success'
            ${startDate ? this.db.$queryRawUnsafe(`AND started_at >= $1`, startDate) : this.db.$queryRawUnsafe('')}
            ${endDate ? this.db.$queryRawUnsafe(`AND started_at <= $1`, endDate) : this.db.$queryRawUnsafe('')}
        `,
      ]);

    const successCount =
      executionsByStatus.find((e) => e.status === 'success')?._count || 0;
    const successRate =
      totalExecutions > 0 ? (successCount / totalExecutions) * 100 : 0;

    return {
      totalExecutions,
      executionsByStatus,
      successRate: successRate.toFixed(2),
      avgExecutionTime: avgExecutionTime[0]?.avg_duration || 0,
    };
  }

  async getUserAnalytics() {
    const topUsersByProjects = await this.db.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        _count: {
          select: {
            projects: true,
          },
        },
      },
      orderBy: {
        projects: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    const topUsersByWorkflows = await this.db.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        _count: {
          select: {
            createdWorkflows: true,
          },
        },
      },
      orderBy: {
        createdWorkflows: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    const topUsersByExecutions = await this.db.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        _count: {
          select: {
            startedExecutions: true,
          },
        },
      },
      orderBy: {
        startedExecutions: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    // Get inactive users (no executions in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const inactiveUsers = await this.db.user.findMany({
      where: {
        startedExecutions: {
          none: {
            startedAt: {
              gte: thirtyDaysAgo,
            },
          },
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
      take: 20,
    });

    return {
      topUsersByProjects,
      topUsersByWorkflows,
      topUsersByExecutions,
      inactiveUsers,
    };
  }

  async getRegistrationTrend(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const registrations = await this.db.$queryRaw<
      Array<{ date: string; count: bigint }>
    >`
      SELECT DATE(created_at) as date, COUNT(*)::bigint as count
      FROM users
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    return registrations.map((r) => ({
      date: r.date,
      count: Number(r.count),
    }));
  }

  async getExecutionTrend(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const executions = await this.db.$queryRaw<
      Array<{ date: string; count: bigint; status: string }>
    >`
      SELECT DATE(started_at) as date, status, COUNT(*)::bigint as count
      FROM workflow_executions
      WHERE started_at >= ${startDate}
      GROUP BY DATE(started_at), status
      ORDER BY date ASC
    `;

    return executions.map((e) => ({
      date: e.date,
      status: e.status,
      count: Number(e.count),
    }));
  }

  async getNodeTypeUsage() {
    const nodeTypeUsage = await this.db.workflowNode.groupBy({
      by: ['typeCode'],
      _count: true,
      orderBy: {
        _count: {
          typeCode: 'desc',
        },
      },
      take: 20,
    });

    return nodeTypeUsage;
  }
}
