import { AppLayout } from "@/components/layout/AppLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { BookingsChart } from "@/components/dashboard/BookingsChart";
import { AssetDistribution } from "@/components/dashboard/AssetDistribution";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Users, ClipboardCheck, CalendarCheck, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchUsers, fetchBookings, fetchAssets } from "@/lib/api";

const Dashboard = () => {
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: fetchUsers, staleTime: 60000, refetchInterval: 10000 });
  const { data: bookings = [] } = useQuery({ queryKey: ['bookings'], queryFn: fetchBookings, staleTime: 60000, refetchInterval: 10000 });
  const { data: assets = [] } = useQuery({ queryKey: ['assets'], queryFn: fetchAssets, staleTime: 60000, refetchInterval: 10000 });

  const stats = {
    users: users.length.toString(),
    pending: assets.filter(x => x.approvalStatus === "Pending").length.toString(),
    bookings: bookings.length.toString(),
    revenue: bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0).toString()
  };
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back. Here's what's happening on AgriFarms.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Total Users" value={stats.users} change="+12.5%" changeType="up" icon={Users} delay={0} />
          <KPICard title="Pending Approvals" value={stats.pending} change="-8.2%" changeType="down" icon={ClipboardCheck} delay={100} />
          <KPICard title="Total Bookings" value={stats.bookings} change="+24.3%" changeType="up" icon={CalendarCheck} delay={200} />
          <KPICard title="Total Revenue" value={`₹${stats.revenue}`} change="0%" changeType="up" icon={DollarSign} delay={300} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BookingsChart />
          <AssetDistribution />
        </div>

        <RecentActivity />
      </div>
    </AppLayout>
  );
};

export default Dashboard;
