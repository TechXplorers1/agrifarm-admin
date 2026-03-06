import {
  LayoutDashboard, Users, Tractor, Truck, Wrench, HardHat,
  CalendarCheck, Receipt, Settings, ChevronDown, Leaf, LogOut
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";

const mainNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
];

const userNav = [
  { title: "All Users", url: "/users", icon: Users },
  { title: "Farmers", url: "/users?role=Farmer", icon: Users },
  { title: "Providers", url: "/users?role=Provider", icon: Users },
];

const assetNav = [
  { title: "Equipment", url: "/assets?category=Equipment", icon: Tractor },
  { title: "Transport", url: "/assets?category=Transport", icon: Truck },
  { title: "Services", url: "/assets?category=Service", icon: Wrench },
  { title: "Farm Workers", url: "/assets?category=Worker+Group", icon: HardHat },
];

const bookingNav = [
  { title: "Active Bookings", url: "/bookings", icon: CalendarCheck },
  { title: "Transaction History", url: "/bookings?status=Completed", icon: Receipt },
];

const settingsNav = [
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname + location.search;

  const handleLogout = () => {
    localStorage.removeItem("agrifarms_auth");
    navigate("/login");
  };

  const isActive = (url: string) => {
    if (url === "/") return location.pathname === "/";
    return path.startsWith(url);
  };

  const NavGroup = ({ label, items }: { label: string; items: typeof mainNav }) => (
    <SidebarGroup>
      {!collapsed && <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive(item.url)}>
                <NavLink to={item.url} end={item.url === "/"} activeClassName="bg-sidebar-accent text-primary font-medium">
                  <item.icon className="h-4 w-4" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  const CollapsibleNavGroup = ({ label, items, defaultOpen }: { label: string; items: typeof mainNav; defaultOpen?: boolean }) => (
    <Collapsible defaultOpen={defaultOpen ?? true} className="group/collapsible">
      <SidebarGroup>
        <CollapsibleTrigger asChild>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70 cursor-pointer hover:text-foreground transition-colors">
            {label}
            {!collapsed && <ChevronDown className="ml-auto h-3.5 w-3.5 transition-transform group-data-[state=open]/collapsible:rotate-180" />}
          </SidebarGroupLabel>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} activeClassName="bg-sidebar-accent text-primary font-medium">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Leaf className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-heading text-base font-bold text-foreground leading-none">AgriFarms</h1>
              <p className="text-[10px] text-muted-foreground mt-0.5">Admin Dashboard</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <NavGroup label="Overview" items={mainNav} />
        <CollapsibleNavGroup label="User Management" items={userNav} />
        <CollapsibleNavGroup label="Asset Moderation" items={assetNav} />
        <CollapsibleNavGroup label="Bookings" items={bookingNav} />
        <NavGroup label="System" items={settingsNav} />
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-2">
        {!collapsed && (
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Platform v2.1.0</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Log Out</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
