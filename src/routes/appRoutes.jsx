import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "../layout/layout";

import Login    from "../pages/login/components/loginPage";
import Register from "../pages/register/components/registerAccount";

import ProtectedRoute, { AdminRoute } from "./protectedRoutes";

import Dashboard    from "../pages/dashboard/Dashboard";
import UsersPage    from "../pages/admin/UsersPage";
import AuditLogPage from "../pages/admin/AuditLogPage";
import DepartmentsPage       from "../pages/admin/DepartmentsPage";
import ReportsPage           from "../pages/admin/ReportsPage";
import AnnouncementsAdminPage from "../pages/admin/AnnouncementsAdminPage";
import ProfilePage  from "../pages/profile/ProfilePage";
import SettingsPage from "../pages/settings/SettingsPage";

import Inbox       from "../pages/announcement/inbox/Inbox";
import Forward     from "../pages/announcement/Forward/Forward";
import Sent        from "../pages/announcement/sent/Sent";
import Attachments from "../pages/announcement/Attachments";
import Drafts      from "../pages/announcement/drafts/Drafts";
import AnnouncementLayout from "../pages/announcement/AnnouncementLayout";
import { AnnouncementProvider } from "../context/AnnouncementContext";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"         element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          element={
            <ProtectedRoute>
              <AnnouncementProvider>
                <AppLayout />
              </AnnouncementProvider>
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile"   element={<ProfilePage />} />
          <Route path="/settings"  element={<SettingsPage />} />

          {/* Admin-only routes */}
          <Route path="/admin/users"          element={<AdminRoute><UsersPage /></AdminRoute>} />
          <Route path="/admin/audit"          element={<AdminRoute><AuditLogPage /></AdminRoute>} />
          <Route path="/admin/departments"    element={<AdminRoute><DepartmentsPage /></AdminRoute>} />
          <Route path="/admin/reports"        element={<AdminRoute><ReportsPage /></AdminRoute>} />
          <Route path="/admin/announcements"  element={<AdminRoute><AnnouncementsAdminPage /></AdminRoute>} />

          <Route element={<AnnouncementLayout />}>
            <Route path="/inbox"       element={<Inbox />} />
            <Route path="/sent"        element={<Sent />} />
            <Route path="/forward"     element={<Forward />} />
            <Route path="/attachments" element={<Attachments />} />
            <Route path="/drafts"      element={<Drafts />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
