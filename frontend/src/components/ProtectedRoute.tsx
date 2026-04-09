import { Navigate, Outlet } from 'react-router-dom';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

export function ProtectedRoute() {
  const token = cookies.get('accessToken');
  return token ? <Outlet /> : <Navigate to="/auth" replace />;
}