import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Auth } from "./pages/authorization/Auth";
import { Reg } from "./pages/registration/Reg";
import { Overview_Scen } from "./pages/overview_scen/Overview_scen";
import { FieldFeedbackProvider } from "./context/FieldFeedbackContext";

export default function App() {
  return (
    <FieldFeedbackProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/register" element={<Reg />} />
          <Route path="/overview_scen" element={<Overview_Scen />} />
        </Routes>
      </BrowserRouter>
    </FieldFeedbackProvider>
  );
}
