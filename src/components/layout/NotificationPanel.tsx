import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Bell, CheckCircle, AlertTriangle, UserPlus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAdminNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

const iconColors: Record<string, string> = {
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/10",
  destructive: "text-destructive bg-destructive/10",
};

export function NotificationPanel({ open, onOpenChange }: NotificationPanelProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: rawNotifications = [] } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: fetchAdminNotifications,
    refetchInterval: 10000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    }
  });

  const notifications = rawNotifications.map((n: any) => ({
    id: n.id,
    icon: n.type === 'success' ? CheckCircle : n.type === 'warning' ? Package : n.type === 'destructive' ? AlertTriangle : Bell,
    title: n.title,
    description: n.message,
    time: n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : "just now",
    read: n.read,
    type: n.type || "warning",
    relatedId: n.relatedId
  }));

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  const handleNotificationClick = (n: any) => {
    if (!n.read) markAsReadMutation.mutate(n.id);
    
    const title = n.title.toLowerCase();
    const selectParam = n.relatedId ? `&select=${n.relatedId}` : "";
    
    if (title.includes("user")) {
      navigate(`/users?select=${n.relatedId}`);
    } else if (title.includes("equipment")) {
      navigate(`/assets?category=Equipment${selectParam}`);
    } else if (title.includes("service")) {
      navigate(`/assets?category=Services${selectParam}`);
    } else if (title.includes("transport") || title.includes("vehicle")) {
      navigate(`/assets?category=Transport${selectParam}`);
    } else if (title.includes("worker")) {
      navigate(`/assets?category=Farm Workers${selectParam}`);
    } else if (title.includes("asset")) {
      navigate(`/assets?category=all${selectParam}`);
    } else if (title.includes("booking")) {
      navigate(`/bookings?select=${n.relatedId}`);
    }
    
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-heading flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <span className="ml-1 text-xs bg-destructive text-destructive-foreground rounded-full px-2 py-0.5">
                  {unreadCount}
                </span>
              )}
            </SheetTitle>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => markAllReadMutation.mutate()}>
              Mark all read
            </Button>
          </div>
        </SheetHeader>

        <div className="divide-y divide-border">
          {notifications.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No notifications available
            </div>
          )}
          {notifications.map((n: any) => (
            <div
              key={n.id}
              className={`p-4 flex gap-3 transition-colors hover:bg-muted/30 cursor-pointer ${!n.read ? "bg-primary/5" : ""}`}
              onClick={() => handleNotificationClick(n)}
            >
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${iconColors[n.type]}`}>
                <n.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm leading-snug ${!n.read ? "font-medium text-foreground" : "text-foreground/80"}`}>
                    {n.title}
                  </p>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{n.description}</p>
                <p className="text-xs text-muted-foreground/60 mt-1">{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
