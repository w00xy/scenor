import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Auth } from "./pages/authorization/Auth"; // новая страница с блюром и формой
import { Reg } from "./pages/registration/Reg"; // аналогично
import { Overview } from "./pages/overview/Overview";
import { Overview_scen } from "./components/overview/pages_overview/overview_scen/overview_scen";
import { Overview_credentials } from "./components/overview/pages_overview/overview_credentials/overview_credentials";
import { SettingsLayout } from "./pages/settings/SettingsLayout";
import { FieldFeedbackProvider } from "./context/FieldFeedbackContext";
import { MenuProvider } from "./context/MenuContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useEffect } from "react";
import { getAccessToken } from "./services/api";
import { scheduleTokenRefresh, stopTokenRefresh } from "./services/tokenRefresher";
import { ProfileSettings } from "./components/settings/profile-settings/profile-settings";
import { PersonalProject } from "./pages/PersonalProject/PersonalProject";
import { PersonalScenariosPage } from "./pages/PersonalProject/personal-pages/PersonalScenariosPage";
import { PersonalCredentialsPage } from "./pages/PersonalProject/personal-pages/PersonalCredentialsPage";
import { PersonalHistoryPage } from "./pages/PersonalProject/personal-pages/PersonalHistoryPage";
import { PersonalDataTablePage } from "./pages/PersonalProject/personal-pages/PersonalDataTablePage";

export default function App() {
  useEffect(() => {
    if (getAccessToken()) {
      scheduleTokenRefresh();
    }
    return () => stopTokenRefresh();
  }, []);
  return (
    <FieldFeedbackProvider>
      <MenuProvider>
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
              <Route path="/personal" element={<PersonalProject />}>
                <Route index element={<Navigate to="scenario" replace />} />
                <Route path="scenario" element={<PersonalScenariosPage />} />
                <Route
                  path="credentials"
                  element={<PersonalCredentialsPage />}
                />
                <Route path="history" element={<PersonalHistoryPage />} />
                <Route path="data-table" element={<PersonalDataTablePage />} />
              </Route>
              <Route path="/settings" element={<SettingsLayout />}>
                <Route path="profile" element={<ProfileSettings />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </MenuProvider>
    </FieldFeedbackProvider>
  );
}
