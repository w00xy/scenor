import { JSX } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import './AdminLayout.scss';

const navItems = [
  { path: '/admin/dashboard', label: 'Дашборд' },
  { path: '/admin/users', label: 'Пользователи' },
  { path: '/admin/projects', label: 'Проекты' },
  { path: '/admin/audit', label: 'Аудит' },
];

export function AdminLayout(): JSX.Element {
  const location = useLocation();

  return (
    <div className="admin-layout">
      <aside className="admin-layout__sidebar">
        <div className="admin-layout__brand">Scenor Admin</div>
        <nav className="admin-layout__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `admin-layout__nav-item${isActive ? ' admin-layout__nav-item--active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <NavLink to="/overview/scenario" className="admin-layout__back-link">
          ← К платформе
        </NavLink>
      </aside>
      <main className="admin-layout__content">
        <Outlet />
      </main>
    </div>
  );
}
