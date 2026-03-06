import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Bell, CheckCircle, AlertTriangle, UserPlus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const notifications = [
  { id: 1, icon: Package, title: "New asset submitted", description: "Kubota Combine Harvester awaiting approval", time: "2 min ago", read: false, type: "warning" as const },
  { id: 2, icon: UserPlus, title: "New user registered", description: "Florence Akello joined as a Farmer", time: "15 min ago", read: false, type: "success" as const },
  { id: 3, icon: AlertTriangle, title: "Asset reported", description: "Crop Spraying Drone flagged by user", time: "1 hour ago", read: false, type: "destructive" as const },
  { id: 4, icon: CheckCircle, title: "Booking completed", description: "BK-002: 10-Ton Farm Truck delivery done", time: "2 hours ago", read: true, type: "success" as const },
  { id: 5, icon: Package, title: "Asset updated", description: "Planting Team details modified by Field Masters", time: "3 hours ago", read: true, type: "warning" as const },
  { id: 6, icon: UserPlus, title: "Provider verified", description: "AgroTech Solutions completed verification", time: "5 hours ago", read: true, type: "success" as const },
  { id: 7, icon: AlertTriangle, title: "Payment issue", description: "BK-009 payment refund requested", time: "1 day ago", read: true, type: "destructive" as const },
];

const iconColors: Record<string, string> = {
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/10",
  destructive: "text-destructive bg-destructive/10",
};

export function NotificationPanel({ open, onOpenChange }: NotificationPanelProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

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
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
              Mark all read
            </Button>
          </div>
        </SheetHeader>

        <div className="divide-y divide-border">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 flex gap-3 transition-colors hover:bg-muted/30 ${!n.read ? "bg-primary/5" : ""}`}
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
