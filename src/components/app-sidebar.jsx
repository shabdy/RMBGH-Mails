import * as React from "react";
import { useState, useEffect, useContext } from "react";
import {
  IconDashboard,
  IconSpeakerphone,
  IconSettings,
  IconInnerShadowTop,
  IconShieldLock,
  IconClipboardList,
  IconUsers,
  IconBuilding,
  IconChartBar,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useAnnouncements } from "@/context/AnnouncementContext";
import { AuthContext } from "@/context/authContext";
import { getPendingUserCount } from "@/services/accountsService";

export function AppSidebar({ ...props }) {
  const { unreadCount, drafts } = useAnnouncements();
  const { user } = useContext(AuthContext);
  const isAdmin      = ["admin","superadmin"].includes(user?.role);
  const isSuperAdmin = user?.role === "superadmin";
  const [pendingCount, setPendingCount] = useState(0);

  /* Poll pending user count every 30 s when admin is logged in */
  useEffect(() => {
    if (!isAdmin) return;
    const refresh = () => getPendingUserCount().then((c) => setPendingCount(c));
    refresh();
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, [isAdmin]);

  const navMain = [
    {
      title: "Dashboard",
      icon: IconDashboard,
      url: "/dashboard",
    },
    {
      title: "Mail",
      icon: IconSpeakerphone,
      items: [
        { title: "Inbox", url: "/inbox", badge: unreadCount || undefined },
        { title: "Sent", url: "/sent" },
        { title: "Forwarded", url: "/forward" },
        { title: "Drafts", url: "/drafts", badge: drafts.length || undefined },
        { title: "Attachments", url: "/attachments" },
      ],
    },
  ];

  const adminNav = [
    {
      title: "Administration",
      icon: IconShieldLock,
      items: [
        {
          title: "User Accounts",
          url: "/admin/users",
          badge: pendingCount || undefined,
        },
        { title: "Departments", url: "/admin/departments" },
        { title: "Reports", url: "/admin/reports" },
        { title: "Audit Log", url: "/admin/audit" },
      ],
    },
  ];

  const navSecondary = [
    { title: "Settings", url: "/settings", icon: IconSettings },
  ];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-1.5">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <IconInnerShadowTop className="size-4 text-primary-foreground" />
              </div>
              <div>
                <span className="text-sm font-bold text-foreground block leading-tight">
                  RMBGH
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  Mailing System
                </span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />

        {isSuperAdmin && (
          <>
            <SidebarSeparator />
            <NavMain items={adminNav} />
          </>
        )}

        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
