import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Auth } from "./pages/authorization/Auth"; // новая страница с блюром и формой
import { Reg } from "./pages/registration/Reg"; // аналогично
import { Overview } from "./pages/overview/Overview";
import { Overview_scen } from "./components/overview/pages_overview/overview_scen/overview_scen";
import { Overview_credentials } from "./components/overview/pages_overview/overview_credentials/overview_credentials";
import { Profile } from "./pages/profile/Profile";
import { FieldFeedbackProvider } from "./context/FieldFeedbackContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

export default function App() {
  return (
    <FieldFeedbackProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/register" element={<Reg />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/overview" element={<Overview />}>
              <Route index element={<Navigate to="scenario" replace />} />
              <Route path="scenario" element={<Overview_scen />} />
              <Route path="credentials" element={<Overview_credentials />} />
            </Route>
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </FieldFeedbackProvider>
  );
}