import { AppLayout } from "@/components/layout/AppLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { BookingsChart } from "@/components/dashboard/BookingsChart";
import { AssetDistribution } from "@/components/dashboard/AssetDistribution";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Users, ClipboardCheck, CalendarCheck, DollarSign } from "lucide-react";

const Dashboard = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back. Here's what's happening on AgriFarms.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Total Users" value="1,248" change="+12.5%" changeType="up" icon={Users} delay={0} />
          <KPICard title="Pending Approvals" value="23" change="-8.2%" changeType="down" icon={ClipboardCheck} delay={100} />
          <KPICard title="Total Bookings" value="847" change="+24.3%" changeType="up" icon={CalendarCheck} delay={200} />
          <KPICard title="Total Revenue" value="₹84.2M" change="+18.7%" changeType="up" icon={DollarSign} delay={300} />
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
