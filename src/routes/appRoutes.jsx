import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "../layout/layout";

import Login    from "../pages/login/components/loginPage";
import Register from "../pages/register/components/registerAccount";

import ProtectedRoute, { AdminRoute } from "./protectedRoutes";

import { AnnouncementProvider } from "../context/AnnouncementContext";
import { PostsProvider } from "../context/PostsContext";
import { NotificationsProvider } from "../context/NotificationsContext";

// Lazy-load every page so the initial bundle only ships the login screen.
const Dashboard    = lazy(() => import("../pages/dashboard/Dashboard"));
const UsersPage    = lazy(() => import("../pages/admin/UsersPage"));
const AuditLogPage = lazy(() => import("../pages/admin/AuditLogPage"));
const DepartmentsPage        = lazy(() => import("../pages/admin/DepartmentsPage"));
const ReportsPage            = lazy(() => import("../pages/admin/ReportsPage"));
const AnnouncementsAdminPage = lazy(() => import("../pages/admin/AnnouncementsAdminPage"));
const ProfilePage  = lazy(() => import("../pages/profile/ProfilePage"));
const SettingsPage = lazy(() => import("../pages/settings/SettingsPage"));

const Inbox              = lazy(() => import("../pages/announcement/inbox/Inbox"));
const Forward            = lazy(() => import("../pages/announcement/Forward/Forward"));
const Sent               = lazy(() => import("../pages/announcement/sent/Sent"));
const Attachments        = lazy(() => import("../pages/announcement/Attachments"));
const Drafts             = lazy(() => import("../pages/announcement/drafts/Drafts"));
const AnnouncementLayout = lazy(() => import("../pages/announcement/AnnouncementLayout"));

const AnnouncementFeed = lazy(() => import("../pages/feed/AnnouncementFeed"));
const CalendarPage     = lazy(() => import("../pages/calendar/CalendarPage"));

// Wraps a lazy component in Suspense with a blank fallback.
// Chunks are small (< 50 kB each) so the blank flash is imperceptible.
function S({ children }) {
  return <Suspense fallback={<div className="h-full" />}>{children}</Suspense>;
}

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
                <PostsProvider>
                  <NotificationsProvider>
                    <AppLayout />
                  </NotificationsProvider>
                </PostsProvider>
              </AnnouncementProvider>
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard"     element={<S><Dashboard /></S>} />
          <Route path="/announcements" element={<S><AnnouncementFeed /></S>} />
          <Route path="/calendar"      element={<S><CalendarPage /></S>} />
          <Route path="/profile"       element={<S><ProfilePage /></S>} />
          <Route path="/settings"      element={<S><SettingsPage /></S>} />

          <Route path="/admin/users"         element={<AdminRoute><S><UsersPage /></S></AdminRoute>} />
          <Route path="/admin/audit"         element={<AdminRoute><S><AuditLogPage /></S></AdminRoute>} />
          <Route path="/admin/departments"   element={<AdminRoute><S><DepartmentsPage /></S></AdminRoute>} />
          <Route path="/admin/reports"       element={<AdminRoute><S><ReportsPage /></S></AdminRoute>} />
          <Route path="/admin/announcements" element={<AdminRoute><S><AnnouncementsAdminPage /></S></AdminRoute>} />

          <Route element={<S><AnnouncementLayout /></S>}>
            <Route path="/inbox"       element={<S><Inbox /></S>} />
            <Route path="/sent"        element={<S><Sent /></S>} />
            <Route path="/forward"     element={<S><Forward /></S>} />
            <Route path="/attachments" element={<S><Attachments /></S>} />
            <Route path="/drafts"      element={<S><Drafts /></S>} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
