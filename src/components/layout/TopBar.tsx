import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationPanel } from "./NotificationPanel";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { fetchAdminNotifications } from "@/lib/api";
import { getAdminProfile, AdminProfile } from "@/lib/adminProfile";

export function TopBar() {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profile, setProfile] = useState<AdminProfile>(getAdminProfile());

  useEffect(() => {
    const handleUpdate = () => {
      setProfile(getAdminProfile());
    };
    window.addEventListener("admin-profile-updated", handleUpdate);
    return () => window.removeEventListener("admin-profile-updated", handleUpdate);
  }, []);

  const { data: notifications = [] } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: fetchAdminNotifications,
    refetchInterval: 10000,
  });

  const unreadCount = notifications.filter((n: any) => !n.read).length;
  const initials = profile.name ? profile.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "AD";

  return (
    <>
      <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-3 shrink-0">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users, assets, bookings..."
            className="pl-9 h-9 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/30"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground hover:text-foreground"
                onClick={() => setNotifOpen(true)}
              >
                <Bell className="h-4.5 w-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Notifications</p>
            </TooltipContent>
          </Tooltip>
          <div className="flex items-center gap-2.5 pl-2 border-l border-border">
            <Avatar className="h-8 w-8 border border-border bg-muted">
              <AvatarImage src={profile.avatarUrl} alt={profile.name} className="object-cover" />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-sm font-medium leading-none">{profile.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{profile.role}</p>
            </div>
          </div>
        </div>
      </header>
      <NotificationPanel open={notifOpen} onOpenChange={setNotifOpen} />
    </>
  );
}
