import { AppLayout } from "@/components/layout/AppLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { BookingsChart } from "@/components/dashboard/BookingsChart";
import { AssetDistribution } from "@/components/dashboard/AssetDistribution";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Users, ClipboardCheck, CalendarCheck } from "lucide-react";
import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReportDownloader } from "@/components/dashboard/ReportDownloader";
import { useQuery } from "@tanstack/react-query";
import { fetchUsers, fetchBookings, fetchAssets } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";

const Dashboard = () => {
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({ queryKey: ['users'], queryFn: fetchUsers, staleTime: 60000, refetchInterval: 10000 });
  const { data: bookings = [], isLoading: isLoadingBookings } = useQuery({ queryKey: ['bookings'], queryFn: fetchBookings, staleTime: 60000, refetchInterval: 10000 });
  const { data: assets = [], isLoading: isLoadingAssets } = useQuery({ queryKey: ['assets'], queryFn: fetchAssets, staleTime: 60000, refetchInterval: 10000 });

  const [timeScale, setTimeScale] = useState<"Day" | "Month" | "Year">("Month");
  const [selectedArea, setSelectedArea] = useState<string>("All Areas");

  const uniqueAreas = useMemo(() => {
    const areas = new Set<string>();
    bookings.forEach(b => {
      if (b.location && b.location !== "Unknown Location") {
        areas.add(b.location.split(',')[0].trim()); // Get main city/area
      }
    });
    return ["All Areas", ...Array.from(areas)].sort();
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    if (selectedArea === "All Areas") return bookings;
    return bookings.filter(b => b.location && b.location.includes(selectedArea));
  }, [bookings, selectedArea]);

  const isLoading = isLoadingUsers || isLoadingBookings || isLoadingAssets;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Spinner size={48} />
        </div>
      </AppLayout>
    );
  }


  const stats = {
    users: users.length.toString(),
    pending: assets.filter(x => x.approvalStatus === "Pending").length.toString(),
    bookings: bookings.length.toString()
  };
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Dashboard Overview</h1>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 gap-4">
            <p className="text-sm text-muted-foreground">Welcome back. Here's what's happening on AgriFarms.</p>
            <div className="flex items-center gap-3">
              <Select value={timeScale} onValueChange={(val: any) => setTimeScale(val)}>
                <SelectTrigger className="w-32 bg-card">
                  <SelectValue placeholder="Time Scale" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Day">Daily</SelectItem>
                  <SelectItem value="Month">Monthly</SelectItem>
                  <SelectItem value="Year">Yearly</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedArea} onValueChange={setSelectedArea}>
                <SelectTrigger className="w-40 bg-card">
                  <SelectValue placeholder="Area" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueAreas.map(area => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <ReportDownloader bookings={bookings} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <KPICard title="Total Users" value={stats.users} change="+12.5%" changeType="up" icon={Users} delay={0} />
          <KPICard title="Pending Approvals" value={stats.pending} change="-8.2%" changeType="down" icon={ClipboardCheck} delay={100} />
          <KPICard title="Total Bookings" value={stats.bookings} change="+24.3%" changeType="up" icon={CalendarCheck} delay={200} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BookingsChart bookings={filteredBookings} timeScale={timeScale} />
          <AssetDistribution bookings={filteredBookings} />
        </div>

        <RecentActivity />
      </div>
    </AppLayout>
  );
};

export default Dashboard;
