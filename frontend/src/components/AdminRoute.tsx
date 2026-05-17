import { Navigate, Outlet } from 'react-router-dom';
import { useCurrentUser } from '../context/CurrentUserContext';

export function AdminRoute() {
  const { currentUser, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        color: '#ADADAD',
        fontFamily: 'Inter, sans-serif',
      }}>
        Загрузка...
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
    return <Navigate to="/overview/scenario" replace />;
  }

  return <Outlet />;
}
