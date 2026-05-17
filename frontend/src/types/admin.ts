export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'USER' | 'SUPER_ADMIN';
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProject {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  isArchived: boolean;
  type: 'PERSONAL' | 'TEAM';
  createdAt: string;
  updatedAt: string;
  members: Array<{ role: string }>;
  _count?: { workflows: number; executions: number };
}

export interface PlatformStatistics {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  totalProjects: number;
  personalProjects: number;
  teamProjects: number;
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  successExecutions: number;
  failedExecutions: number;
}

export interface ExecutionAnalytics {
  totalExecutions: number;
  statuses: Record<string, number>;
  successRate: number;
  averageExecutionTime: number | null;
}

export interface UserAnalytics {
  topByExecutions: Array<{
    userId: string;
    username: string;
    executionCount: number;
  }>;
  topByWorkflows: Array<{
    userId: string;
    username: string;
    workflowCount: number;
  }>;
  inactiveUsers: Array<{
    id: string;
    username: string;
    email: string;
    lastActivityAt: string | null;
  }>;
}

export interface TrendDataPoint {
  date: string;
  count: number;
}

export interface NodeTypeUsage {
  typeCode: string;
  displayName: string;
  usageCount: number;
}

export interface AuditLog {
  id: string;
  adminId: string;
  admin?: { username: string };
  action: string;
  targetType: string;
  targetId: string | null;
  details: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  details: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}
