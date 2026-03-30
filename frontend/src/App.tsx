import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Auth } from "./pages/authorization/Auth";
import { Reg } from "./pages/registration/Reg";

import { Overview } from "./pages/overview/Overview";
import { Overview_scen } from "./components/overview/pages_overview/overview_scen/overview_scen";
import { Overview_credentials } from "./components/overview/pages_overview/overview_credentials/overview_credentials";

import { FieldFeedbackProvider } from "./context/FieldFeedbackContext";

export default function App() {
  return (
    <FieldFeedbackProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/register" element={<Reg />} />

          <Route path="/overview_scen" element={<Overview />}>
            <Route index element={<Overview_scen />} />
            <Route path="overview_credentials" element={<Overview_credentials />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </FieldFeedbackProvider>
  );
}