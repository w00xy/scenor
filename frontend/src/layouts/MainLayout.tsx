import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Overview_Scen } from '../pages/overview/Overview';
import { Modal } from '../components/Modal/ModalAuthReg/ModalAuthReg';
import { Auth } from '../pages/authorization/Auth';
import { Reg } from '../pages/registration/Reg';

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const isAuth = location.pathname === '/auth';
  const isRegister = location.pathname === '/register';

  useEffect(() => {
    const knownPaths = ['/overview_scen', '/overview_credentials', '/auth', '/register'];
    if (!knownPaths.includes(location.pathname)) {
      navigate('/overview_scen', { replace: true });
    }
  }, [location.pathname, navigate]);

  const closeModal = () => {
    navigate('/overview_scen');
  };

  return (
    <>
      <Outlet />
      {(isAuth || isRegister) && (
        <Modal onClose={closeModal}>
          {isAuth && <Auth />}
          {isRegister && <Reg />}
        </Modal>
      )}
    </>
  );
}