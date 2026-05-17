import { JSX, useCallback, useEffect, useState } from 'react';
import { adminUsersApi } from '../../services/admin/adminApi';
import type { AdminUser } from '../../types/admin';

export function AdminUsersPage(): JSX.Element {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [blockFilter, setBlockFilter] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminUsersApi.getUsers({
        search: search || undefined,
        role: roleFilter || undefined,
        isBlocked: blockFilter === 'blocked' ? true : blockFilter === 'active' ? false : undefined,
      });
      setUsers(Array.isArray(data) ? data : (data as any).users || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, blockFilter]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleBlock = async (user: AdminUser) => {
    if (!confirm(`${user.isBlocked ? 'Разблокировать' : 'Заблокировать'} ${user.username}?`)) return;
    try {
      if (user.isBlocked) await adminUsersApi.unblockUser(user.id);
      else await adminUsersApi.blockUser(user.id);
      loadUsers();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (user: AdminUser) => {
    if (!confirm(`Удалить пользователя ${user.username}? Это действие необратимо.`)) return;
    try {
      await adminUsersApi.deleteUser(user.id);
      loadUsers();
    } catch (e: any) {
      alert(e?.status === 500
        ? `Нельзя удалить "${user.username}": пользователь владеет проектами. Сначала удалите или передайте его проекты.`
        : `Ошибка: ${e?.message || 'не удалось удалить пользователя'}`);
    }
  };

  const handleResetPassword = async (user: AdminUser) => {
    const pw = prompt('Новый пароль (минимум 8 символов):');
    if (!pw) return;
    try {
      await adminUsersApi.resetPassword(user.id, pw);
      alert('Пароль сброшен');
    } catch (e) { console.error(e); }
  };

  return (
    <div className="admin-users">
      <h1 className="admin-page__title">Управление пользователями</h1>

      <div className="admin-users__filters">
        <input
          type="text"
          placeholder="Поиск по username или email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-users__search"
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="admin-users__select">
          <option value="">Все роли</option>
          <option value="USER">USER</option>
          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
        </select>
        <select value={blockFilter} onChange={(e) => setBlockFilter(e.target.value)} className="admin-users__select">
          <option value="">Все</option>
          <option value="active">Активные</option>
          <option value="blocked">Заблокированные</option>
        </select>
      </div>

      {loading ? (
        <div className="admin-page__loading">Загрузка...</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Роль</th>
              <th>Статус</th>
              <th>Создан</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td><span className={`admin-badge admin-badge--${u.role === 'SUPER_ADMIN' ? 'admin' : 'user'}`}>{u.role}</span></td>
                <td><span className={`admin-badge ${u.isBlocked ? 'admin-badge--danger' : 'admin-badge--success'}`}>{u.isBlocked ? 'Заблокирован' : 'Активен'}</span></td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="admin-table__actions">
                  <button onClick={() => handleBlock(u)} className="admin-btn admin-btn--sm">{u.isBlocked ? 'Разблок.' : 'Блок.'}</button>
                  <button onClick={() => handleResetPassword(u)} className="admin-btn admin-btn--sm">Пароль</button>
                  <button onClick={() => handleDelete(u)} className="admin-btn admin-btn--sm admin-btn--danger">Удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
