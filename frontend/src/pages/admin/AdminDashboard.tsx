import { JSX, useEffect, useState } from 'react';
import { adminAnalyticsApi } from '../../services/admin/adminApi';
import type { PlatformStatistics } from '../../types/admin';
import './AdminDashboard.scss';

export function AdminDashboard(): JSX.Element {
  const [stats, setStats] = useState<PlatformStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAnalyticsApi.getPlatform()
      .then(data => {
        const raw = data as any;
        setStats({
          totalUsers: raw.users?.total ?? raw.totalUsers ?? 0,
          activeUsers: raw.users?.active ?? raw.activeUsers ?? 0,
          blockedUsers: raw.users?.blocked ?? raw.blockedUsers ?? 0,
          totalProjects: raw.projects?.total ?? raw.totalProjects ?? 0,
          personalProjects: raw.projects?.byType?.find((t:any) => t.type === 'PERSONAL')?._count ?? raw.personalProjects ?? 0,
          teamProjects: raw.projects?.byType?.find((t:any) => t.type === 'TEAM')?._count ?? raw.teamProjects ?? 0,
          totalWorkflows: raw.workflows?.total ?? raw.totalWorkflows ?? 0,
          activeWorkflows: raw.workflows?.active ?? raw.activeWorkflows ?? 0,
          totalExecutions: raw.executions?.total ?? raw.totalExecutions ?? 0,
          successExecutions: raw.executions?.success ?? raw.successExecutions ?? 0,
          failedExecutions: raw.executions?.failed ?? raw.failedExecutions ?? 0,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-page__loading">Загрузка...</div>;

  const cards = stats ? [
    {
      label: 'Пользователи',
      value: stats.totalUsers,
      stats: [
        { label: 'Активных', value: stats.activeUsers, color: '#4caf50' },
        { label: 'Заблокированных', value: stats.blockedUsers, color: '#ff4b33' },
      ],
    },
    {
      label: 'Проекты',
      value: stats.totalProjects,
      stats: [
        { label: 'Личных', value: stats.personalProjects, color: '#6ea8fe' },
        { label: 'Командных', value: stats.teamProjects, color: '#ff9800' },
      ],
    },
    {
      label: 'Сценарии',
      value: stats.totalWorkflows,
      stats: [
        { label: 'Всего', value: stats.totalWorkflows, color: '#9c27b0' },
        { label: 'Активных', value: stats.activeWorkflows, color: '#4caf50' },
      ],
    },
    {
      label: 'Выполнения',
      value: stats.totalExecutions,
      stats: [
        { label: 'Успешно', value: stats.successExecutions, color: '#4caf50' },
        { label: 'С ошибкой', value: stats.failedExecutions, color: '#ff4b33' },
      ],
    },
  ] : [];

  return (
    <div>
      <h1 className="admin-page__title">Панель администрирования</h1>
      <div className="admin-dashboard__grid">
        {cards.map(card => (
          <div key={card.label} className="admin-dashboard__card">
            <div className="admin-dashboard__card-header">
              <span className="admin-dashboard__card-label">{card.label}</span>
              <span className="admin-dashboard__card-value">{card.value}</span>
            </div>
            <div className="admin-dashboard__card-stats">
              {card.stats.map(s => (
                <div key={s.label} className="admin-dashboard__stat">
                  <span className="admin-dashboard__stat-dot" style={{ background: s.color }} />
                  <span className="admin-dashboard__stat-label">{s.label}</span>
                  <span className="admin-dashboard__stat-value">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
