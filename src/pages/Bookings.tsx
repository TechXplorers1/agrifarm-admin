import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { mockBookings, Booking, formatCurrency } from "@/data/mockData";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, MapPin, FileText, Clock, Users, Calendar } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const BookingsPage = () => {
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get("status") || "all";
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(statusParam);
  const [assetTypeFilter, setAssetTypeFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const filtered = useMemo(() => {
    return mockBookings.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (assetTypeFilter !== "all" && b.assetType !== assetTypeFilter) return false;
      if (search && !b.farmerName.toLowerCase().includes(search.toLowerCase()) && !b.id.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, statusFilter, assetTypeFilter]);

  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Booking Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor and manage all platform bookings</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by ID or farmer name..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Confirmed">Confirmed</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={assetTypeFilter} onValueChange={setAssetTypeFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Asset Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Equipment">Equipment</SelectItem>
              <SelectItem value="Transport">Transport</SelectItem>
              <SelectItem value="Service">Service</SelectItem>
              <SelectItem value="Worker Group">Worker Group</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-xl bg-card shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs">Booking ID</TableHead>
                  <TableHead className="text-xs">Farmer</TableHead>
                  <TableHead className="text-xs">Provider</TableHead>
                  <TableHead className="text-xs">Asset</TableHead>
                  <TableHead className="text-xs">Schedule</TableHead>
                  <TableHead className="text-xs">Amount</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((booking) => (
                  <TableRow key={booking.id} className="cursor-pointer" onClick={() => setSelectedBooking(booking)}>
                    <TableCell className="font-mono text-xs">{booking.id}</TableCell>
                    <TableCell className="text-sm">{booking.farmerName}</TableCell>
                    <TableCell className="text-sm">{booking.providerName}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{booking.assetName}</p>
                        <p className="text-xs text-muted-foreground">{booking.assetType}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{new Date(booking.scheduleTime).toLocaleDateString()}</TableCell>
                    <TableCell className="text-sm font-medium">{formatCurrency(booking.totalAmount)}</TableCell>
                    <TableCell><StatusBadge status={booking.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filtered.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              <p className="font-medium">No bookings found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>

      <Sheet open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selectedBooking && (
            <>
              <SheetHeader>
                <SheetTitle className="font-heading">Booking Details</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-sm text-muted-foreground">{selectedBooking.id}</p>
                    <h3 className="font-heading font-semibold text-lg">{selectedBooking.assetName}</h3>
                  </div>
                  <StatusBadge status={selectedBooking.status} />
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground">Total Amount</p>
                  <p className="text-xl font-heading font-bold text-primary mt-1">{formatCurrency(selectedBooking.totalAmount)}</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {[
                    { icon: Users, label: "Farmer", value: selectedBooking.farmerName },
                    { icon: Users, label: "Provider", value: selectedBooking.providerName },
                    { icon: MapPin, label: "Location", value: selectedBooking.location },
                    { icon: Calendar, label: "Scheduled", value: new Date(selectedBooking.scheduleTime).toLocaleString() },
                    { icon: Clock, label: "Created", value: new Date(selectedBooking.createdAt).toLocaleString() },
                    { icon: FileText, label: "Notes", value: selectedBooking.notes },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3 bg-muted/50 rounded-lg p-3">
                      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="text-sm font-medium mt-0.5">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
};

export default BookingsPage;
