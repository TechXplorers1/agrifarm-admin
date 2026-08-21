import { useState, useMemo, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Booking, formatCurrency } from "@/data/mockData";
import { fetchBookings, updateBookingStatus } from "@/lib/api";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, MapPin, FileText, Clock, Users, Calendar, Eye, XCircle } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

const BookingsPage = () => {
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get("status") || "all";
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(statusParam);
  const [assetTypeFilter, setAssetTypeFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [confirmModalTarget, setConfirmModalTarget] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  
  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason: string }) => 
      updateBookingStatus(bookingId, "CANCELLED", reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success("Booking cancelled successfully");
      
      if (selectedBooking && selectedBooking.id === variables.bookingId) {
        setSelectedBooking({ ...selectedBooking, status: "Cancelled" });
      }
      setConfirmModalTarget(null);
      setCancelReason("");
    },
    onError: () => {
      toast.error("Failed to cancel booking");
    }
  });

  const initiateCancel = (booking: Booking, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setConfirmModalTarget(booking);
    setCancelReason("");
  };

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: fetchBookings,
    staleTime: 60000,
    refetchInterval: 10000,
  });

  const selectId = searchParams.get("select");

  useEffect(() => {
    if (selectId && bookings.length > 0) {
      const booking = bookings.find(b => b.id === selectId);
      if (booking) {
        setSelectedBooking(booking);
      }
    }
  }, [selectId, bookings]);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (assetTypeFilter !== "all" && b.assetType !== assetTypeFilter) return false;
      if (search && !b.farmerName.toLowerCase().includes(search.toLowerCase()) && !b.id.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, statusFilter, assetTypeFilter, bookings]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Spinner size={48} />
        </div>
      </AppLayout>
    );
  }

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
                  <TableHead className="text-xs text-right">Actions</TableHead>
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
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => setSelectedBooking(booking)}>
                              <Eye className="h-3.5 w-3.5" />
                              <span className="sr-only">View Details</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>View Details</p>
                          </TooltipContent>
                        </Tooltip>

                        {(booking.status?.toUpperCase() !== "CANCELLED" && booking.status?.toUpperCase() !== "REJECTED" && booking.status?.toUpperCase() !== "COMPLETED") && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-muted-foreground hover:text-destructive disabled:opacity-50"
                                disabled={cancelMutation.isPending}
                                onClick={(e) => initiateCancel(booking, e)}
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                <span className="sr-only">Cancel Booking</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p>Cancel Booking</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
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

      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-xl p-6">
          {selectedBooking && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-xl">Booking Details</DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-6">
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

                {(selectedBooking.status?.toUpperCase() !== "CANCELLED" && selectedBooking.status?.toUpperCase() !== "REJECTED" && selectedBooking.status?.toUpperCase() !== "COMPLETED") && (
                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Button
                      variant="destructive"
                      className="flex-1"
                      disabled={cancelMutation.isPending}
                      onClick={() => initiateCancel(selectedBooking)}
                    >
                      <XCircle className="h-4 w-4 mr-1.5" />
                      Cancel Booking
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmModalTarget} onOpenChange={(open) => !open && setConfirmModalTarget(null)}>
        <DialogContent className="sm:max-w-md rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Cancel Booking
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              Please enter the reason for cancelling booking <span className="font-mono">{confirmModalTarget?.id}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 my-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Reason for cancellation <span className="text-destructive">*</span>
            </label>
            <Textarea
              placeholder="Enter detailed reason..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          <DialogFooter className="flex gap-2 sm:justify-end mt-4">
            <Button variant="outline" onClick={() => setConfirmModalTarget(null)} disabled={cancelMutation.isPending}>
              Back
            </Button>
            <Button
              variant="destructive"
              disabled={cancelMutation.isPending || !cancelReason.trim()}
              onClick={() => {
                if (!confirmModalTarget) return;
                cancelMutation.mutate({
                  bookingId: confirmModalTarget.id,
                  reason: cancelReason.trim()
                });
              }}
            >
              {cancelMutation.isPending ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default BookingsPage;
