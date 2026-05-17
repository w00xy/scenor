import { request } from '../api';
import type {
  AdminUser,
  AdminProject,
  PlatformStatistics,
  ExecutionAnalytics,
  UserAnalytics,
  TrendDataPoint,
  NodeTypeUsage,
  AuditLog,
  UserActivity,
} from '../../types/admin';

const BASE = '/admin';

export const adminUsersApi = {
  getUsers: (params?: {
    limit?: number;
    offset?: number;
    search?: string;
    role?: string;
    isBlocked?: boolean;
  }) => {
    const qs = new URLSearchParams();
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.offset) qs.set('offset', String(params.offset));
    if (params?.search) qs.set('search', params.search);
    if (params?.role) qs.set('role', params.role);
    if (params?.isBlocked !== undefined) qs.set('isBlocked', String(params.isBlocked));
    const query = qs.toString();
    return request<AdminUser[]>(`${BASE}/users${query ? `?${query}` : ''}`, {}, true);
  },

  getUser: (id: string) =>
    request<AdminUser>(`${BASE}/users/${id}`, {}, true),

  updateUser: (id: string, data: { username?: string; email?: string; role?: string }) =>
    request<AdminUser>(`${BASE}/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }, true),

  blockUser: (id: string) =>
    request<AdminUser>(`${BASE}/users/${id}/block`, { method: 'POST' }, true),

  unblockUser: (id: string) =>
    request<AdminUser>(`${BASE}/users/${id}/unblock`, { method: 'POST' }, true),

  deleteUser: (id: string) =>
    request<void>(`${BASE}/users/${id}`, { method: 'DELETE' }, true),

  resetPassword: (id: string, newPassword: string) =>
    request<{ success: boolean }>(`${BASE}/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    }, true),

  getUserActivity: (id: string) =>
    request<UserActivity[]>(`${BASE}/users/${id}/activity`, {}, true),
};

export const adminProjectsApi = {
  getProjects: (params?: {
    limit?: number;
    offset?: number;
    search?: string;
    type?: string;
    isArchived?: boolean;
    ownerId?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.offset) qs.set('offset', String(params.offset));
    if (params?.search) qs.set('search', params.search);
    if (params?.type) qs.set('type', params.type);
    if (params?.isArchived !== undefined) qs.set('isArchived', String(params.isArchived));
    if (params?.ownerId) qs.set('ownerId', params.ownerId);
    const query = qs.toString();
    return request<AdminProject[]>(`${BASE}/projects${query ? `?${query}` : ''}`, {}, true);
  },

  getProject: (id: string) =>
    request<AdminProject>(`${BASE}/projects/${id}`, {}, true),

  updateProject: (id: string, data: { name?: string; description?: string; isArchived?: boolean }) =>
    request<AdminProject>(`${BASE}/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }, true),

  deleteProject: (id: string) =>
    request<void>(`${BASE}/projects/${id}`, { method: 'DELETE' }, true),

  transferOwnership: (id: string, newOwnerId: string) =>
    request<AdminProject>(`${BASE}/projects/${id}/transfer`, {
      method: 'POST',
      body: JSON.stringify({ newOwnerId }),
    }, true),

  getProjectStatistics: (id: string) =>
    request<{ workflowCount: number; executionCount: number }>(
      `${BASE}/projects/${id}/statistics`, {}, true,
    ),
};

export const adminAnalyticsApi = {
  getPlatform: () =>
    request<PlatformStatistics>(`${BASE}/analytics/platform`, {}, true),

  getExecutions: (params?: { startDate?: string; endDate?: string }) => {
    const qs = new URLSearchParams();
    if (params?.startDate) qs.set('startDate', params.startDate);
    if (params?.endDate) qs.set('endDate', params.endDate);
    const query = qs.toString();
    return request<ExecutionAnalytics>(
      `${BASE}/analytics/executions${query ? `?${query}` : ''}`, {}, true,
    );
  },

  getUsers: () =>
    request<UserAnalytics>(`${BASE}/analytics/users`, {}, true),

  getRegistrationTrend: (days = 30) =>
    request<TrendDataPoint[]>(`${BASE}/analytics/trends/registrations?days=${days}`, {}, true),

  getExecutionTrend: (days = 30) =>
    request<TrendDataPoint[]>(`${BASE}/analytics/trends/executions?days=${days}`, {}, true),

  getNodeTypeUsage: () =>
    request<NodeTypeUsage[]>(`${BASE}/analytics/node-types/usage`, {}, true),
};

export const adminAuditApi = {
  getLogs: (params?: {
    limit?: number;
    offset?: number;
    action?: string;
    targetType?: string;
    adminId?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.offset) qs.set('offset', String(params.offset));
    if (params?.action) qs.set('action', params.action);
    if (params?.targetType) qs.set('targetType', params.targetType);
    if (params?.adminId) qs.set('adminId', params.adminId);
    const query = qs.toString();
    return request<AuditLog[]>(`${BASE}/audit/logs${query ? `?${query}` : ''}`, {}, true);
  },
};
