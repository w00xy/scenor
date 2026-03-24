import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Overview_Scen } from "./pages/overview_scen/Overview_scen";
import { Auth } from "./pages/authorization/Auth";
import { Reg } from "./pages/registration/Reg";
import { Modal } from "./components/Modal/ModalAuthReg/ModalAuthReg";
import { FieldFeedbackProvider } from "./context/FieldFeedbackContext";

function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const isAuth = location.pathname === "/auth";
  const isRegister = location.pathname === "/register";

  if (location.pathname !== "/overview_scen" && !isAuth && !isRegister) {
    navigate("/overview_scen", { replace: true });
    return null;
  }

  const closeModal = () => {
    navigate("/overview_scen");
  };

  return (
    <>
      <Overview_Scen />
      {(isAuth || isRegister) && (
        <Modal onClose={closeModal}>
          {isAuth && <Auth />}
          {isRegister && <Reg />}
        </Modal>
      )}
    </>
  );
}

export default function App() {
  return (
    <FieldFeedbackProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/overview_scen" replace />} />
          <Route path="*" element={<MainLayout />} />
        </Routes>
      </BrowserRouter>
    </FieldFeedbackProvider>
  );
}
