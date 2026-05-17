import { JSX, useEffect, useState } from 'react';
import { adminAnalyticsApi } from '../../services/admin/adminApi';
import type { PlatformStatistics } from '../../types/admin';
import './AdminDashboard.scss';

export function AdminDashboard(): JSX.Element {
  const [stats, setStats] = useState<PlatformStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAnalyticsApi.getPlatform()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-page__loading">Загрузка...</div>;

  const cards = stats ? [
    { label: 'Пользователей', value: stats.totalUsers, sub: `${stats.activeUsers} активно / ${stats.blockedUsers} заблокировано` },
    { label: 'Проектов', value: stats.totalProjects, sub: `${stats.personalProjects} личных / ${stats.teamProjects} командных` },
    { label: 'Сценариев', value: stats.totalWorkflows, sub: `${stats.activeWorkflows} активных` },
    { label: 'Выполнений', value: stats.totalExecutions, sub: `${stats.successExecutions} успешно / ${stats.failedExecutions} с ошибкой` },
  ] : [];

  return (
    <div className="admin-dashboard">
      <h1 className="admin-page__title">Панель администрирования</h1>
      <div className="admin-dashboard__grid">
        {cards.map((card) => (
          <div key={card.label} className="admin-dashboard__card">
            <div className="admin-dashboard__card-value">{card.value}</div>
            <div className="admin-dashboard__card-label">{card.label}</div>
            <div className="admin-dashboard__card-sub">{card.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
