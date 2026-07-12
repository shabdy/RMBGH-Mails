import { useContext } from "react";
import { AuthContext } from "../../context/authContext";
import SuperAdminDashboard from "./SuperAdminDashboard";
import AdminDashboard from "./AdminDashboard";
import AnnouncementFeed from "../feed/AnnouncementFeed";

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  if (user?.role === "superadmin") return <SuperAdminDashboard />;
  if (user?.role === "admin")      return <AdminDashboard />;
  return <AnnouncementFeed />;
}
