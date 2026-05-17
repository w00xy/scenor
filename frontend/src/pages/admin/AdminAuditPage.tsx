import { JSX, useCallback, useEffect, useState } from 'react';
import { adminAuditApi } from '../../services/admin/adminApi';
import type { AuditLog } from '../../types/admin';
import './AdminAuditPage.scss';

export function AdminAuditPage(): JSX.Element {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [targetFilter, setTargetFilter] = useState('');

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminAuditApi.getLogs({
        action: actionFilter || undefined,
        targetType: targetFilter || undefined,
      });
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [actionFilter, targetFilter]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const actionLabels: Record<string, string> = {
    USER_UPDATE: 'Обновление пользователя',
    USER_DELETE: 'Удаление пользователя',
    USER_BLOCK: 'Блокировка',
    USER_UNBLOCK: 'Разблокировка',
    USER_RESET_PASSWORD: 'Сброс пароля',
    PROJECT_UPDATE: 'Обновление проекта',
    PROJECT_DELETE: 'Удаление проекта',
    PROJECT_TRANSFER: 'Передача владения',
  };

  return (
    <div className="admin-audit">
      <h1 className="admin-page__title">Журнал аудита</h1>

      <div className="admin-audit__filters">
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="admin-users__select">
          <option value="">Все действия</option>
          {Object.entries(actionLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select value={targetFilter} onChange={(e) => setTargetFilter(e.target.value)} className="admin-users__select">
          <option value="">Все типы</option>
          <option value="USER">USER</option>
          <option value="PROJECT">PROJECT</option>
        </select>
      </div>

      {loading ? (
        <div className="admin-page__loading">Загрузка...</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Админ</th>
              <th>Действие</th>
              <th>Тип цели</th>
              <th>ID цели</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td>{new Date(l.createdAt).toLocaleString()}</td>
                <td>{l.admin?.username || l.adminId.slice(0, 8)}</td>
                <td>{actionLabels[l.action] || l.action}</td>
                <td>{l.targetType}</td>
                <td className="admin-table__mono">{l.targetId ? `${l.targetId.slice(0, 8)}...` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
