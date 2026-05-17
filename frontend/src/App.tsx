import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Auth } from "./pages/authorization/Auth"; 
import { Reg } from "./pages/registration/Reg"; 
import { Overview } from "./pages/overview/Overview";
import { Overview_scen } from "./components/overview/pages_overview/overview_scen/overview_scen";
import { Overview_credentials } from "./components/overview/pages_overview/overview_credentials/overview_credentials";
import { SettingsLayout } from "./pages/settings/SettingsLayout";
import { CurrentUserProvider } from "./context/CurrentUserContext";
import { FieldFeedbackProvider } from "./context/FieldFeedbackContext";
import { MenuProvider } from "./context/MenuContext";
import { ProjectsProvider } from "./context/ProjectsContext";
import { WorkflowsProvider } from "./context/WorkflowsContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { ProfileSettings } from "./components/settings/profile-settings/profile-settings";
import { ProjectRouter } from "./pages/ProjectRouter";
import { ProjectPageRouter } from "./pages/ProjectPageRouter";
import { TeamProjectSettingsPage } from "./pages/TeamProject/team-pages/TeamProjectSettingsPage";
import { WorkflowEditor } from "./pages/WorkflowEditor/WorkflowEditor";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminProjectsPage } from "./pages/admin/AdminProjectsPage";
import { AdminAuditPage } from "./pages/admin/AdminAuditPage";

export default function App() {
  return (
    <FieldFeedbackProvider>
      <MenuProvider>
        <CurrentUserProvider>
          <ProjectsProvider>
            <WorkflowsProvider>
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
                    <Route path="/projects/:projectId" element={<ProjectRouter />}>
                      <Route index element={<Navigate to="scenario" replace />} />
                      <Route path="scenario" element={<ProjectPageRouter pageType="scenario" />} />
                      <Route path="credentials" element={<ProjectPageRouter pageType="credentials" />} />
                      <Route path="history" element={<ProjectPageRouter pageType="history" />} />
                      <Route path="data-table" element={<ProjectPageRouter pageType="data-table" />} />
                      <Route path="settings" element={<TeamProjectSettingsPage />} />
                    </Route>
                    <Route path="/projects/:projectId/workflows/:workflowId" element={<WorkflowEditor />} />
                    <Route path="/settings" element={<SettingsLayout />}>
                      <Route path="profile" element={<ProfileSettings />} />
                    </Route>
                    <Route element={<AdminRoute />}>
                      <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="users" element={<AdminUsersPage />} />
                        <Route path="projects" element={<AdminProjectsPage />} />
                        <Route path="audit" element={<AdminAuditPage />} />
                      </Route>
                    </Route>
                  </Route>
                </Routes>
              </BrowserRouter>
            </WorkflowsProvider>
          </ProjectsProvider>
        </CurrentUserProvider>
      </MenuProvider>
    </FieldFeedbackProvider>
  );
}
