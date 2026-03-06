import { cn } from "@/lib/utils";

type StatusType = "Active" | "Suspended" | "Banned" | "Pending" | "Approved" | "Rejected" | "Confirmed" | "Completed" | "Cancelled" | "Available" | "Booked" | "Maintenance";

const statusStyles: Record<StatusType, string> = {
  Active: "bg-success/10 text-success",
  Available: "bg-success/10 text-success",
  Approved: "bg-success/10 text-success",
  Confirmed: "bg-primary/10 text-primary",
  Completed: "bg-primary/10 text-primary",
  Pending: "bg-warning/10 text-warning",
  Suspended: "bg-warning/10 text-warning",
  Booked: "bg-accent/20 text-accent-foreground",
  Maintenance: "bg-muted text-muted-foreground",
  Rejected: "bg-destructive/10 text-destructive",
  Cancelled: "bg-destructive/10 text-destructive",
  Banned: "bg-destructive/10 text-destructive",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const style = statusStyles[status as StatusType] ?? "bg-muted text-muted-foreground";
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", style, className)}>
      {status}
    </span>
  );
}
