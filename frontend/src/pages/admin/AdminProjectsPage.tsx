import { JSX, useCallback, useEffect, useState } from 'react';
import { adminProjectsApi } from '../../services/admin/adminApi';
import type { AdminProject } from '../../types/admin';

export function AdminProjectsPage(): JSX.Element {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminProjectsApi.getProjects({
        search: search || undefined,
        type: typeFilter || undefined,
      });
      setProjects(Array.isArray(data) ? data : (data as any).projects || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter]);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  const handleDelete = async (p: AdminProject) => {
    if (!confirm(`Удалить проект "${p.name}"? Это удалит все workflow и executions.`)) return;
    try {
      await adminProjectsApi.deleteProject(p.id);
      loadProjects();
    } catch (e) { console.error(e); }
  };

  const handleTransfer = async (p: AdminProject) => {
    const newOwnerId = prompt('ID нового владельца:');
    if (!newOwnerId) return;
    try {
      await adminProjectsApi.transferOwnership(p.id, newOwnerId);
      loadProjects();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="admin-projects">
      <h1 className="admin-page__title">Управление проектами</h1>

      <div className="admin-projects__filters">
        <input
          type="text"
          placeholder="Поиск по названию..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-users__search"
        />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="admin-users__select">
          <option value="">Все типы</option>
          <option value="PERSONAL">PERSONAL</option>
          <option value="TEAM">TEAM</option>
        </select>
      </div>

      {loading ? (
        <div className="admin-page__loading">Загрузка...</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Тип</th>
              <th>Владелец</th>
              <th>Архивирован</th>
              <th>Создан</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td><span className={`admin-badge ${p.type === 'PERSONAL' ? 'admin-badge--user' : 'admin-badge--admin'}`}>{p.type}</span></td>
                <td className="admin-table__mono">{p.ownerId.slice(0, 8)}...</td>
                <td><span className={`admin-badge ${p.isArchived ? 'admin-badge--danger' : 'admin-badge--success'}`}>{p.isArchived ? 'Да' : 'Нет'}</span></td>
                <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                <td className="admin-table__actions">
                  <button onClick={() => handleTransfer(p)} className="admin-btn admin-btn--sm">Передать</button>
                  <button onClick={() => handleDelete(p)} className="admin-btn admin-btn--sm admin-btn--danger">Удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
