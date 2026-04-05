import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { Modal } from '../components/Modal/ModalAuthReg/Modal';
import { Auth } from '../pages/authorization/Auth';
import { Reg } from '../pages/registration/Reg';
import Cookies from 'universal-cookie';
import { Overview } from '../pages/overview/Overview'; // импортируем Overview

const cookies = new Cookies();

export function MainLayout() {
  const location = useLocation();
  const token = cookies.get('accessToken');

  const isAuth = location.pathname === '/auth';
  const isRegister = location.pathname === '/register';
  const isProtected = location.pathname.startsWith('/overview_scen') || location.pathname === '/profile';

  if (isProtected && !token) {
    return <Navigate to="/auth" replace />;
  }
  if (token && (isAuth || isRegister)) {
    return <Navigate to="/overview_scen" replace />;
  }

  const showModal = isAuth || isRegister;

  return (
    <>
      {/* Всегда рендерим Overview */}
      <Overview />
      {showModal && (
        <Modal>
          {isAuth && <Auth />}
          {isRegister && <Reg />}
        </Modal>
      )}
    </>
  );
}