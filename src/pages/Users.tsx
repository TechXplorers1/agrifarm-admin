import { useState, useMemo, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Asset, User, formatCurrency } from "@/data/mockData";
import { fetchUsers, fetchAssets } from "@/lib/api";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, Eye, UserX, UserCheck, Star, Package, AlertTriangle } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { ImagePreviewDialog } from "@/components/shared/ImagePreviewDialog";
import { AssetDetailsSheet } from "@/components/shared/AssetDetailsSheet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserStatus } from "@/lib/api";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

interface StatusChangeTarget {
  user: User;
  newStatus: "Active" | "Deactivated";
}

const UsersPage = () => {
  const [searchParams] = useSearchParams();
  const roleFilter = searchParams.get("role") || "all";
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedAssetDetails, setSelectedAssetDetails] = useState<Asset | null>(null);
  const [confirmModalTarget, setConfirmModalTarget] = useState<StatusChangeTarget | null>(null);
  const [statusReason, setStatusReason] = useState("");

  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 60000,
    refetchInterval: 10000,
  });
  const { data: allAssets = [], isLoading: isLoadingAssets } = useQuery({
    queryKey: ['assets'],
    queryFn: fetchAssets,
    staleTime: 60000,
    refetchInterval: 10000,
  });

  const isLoading = isLoadingUsers || isLoadingAssets;

  const selectId = searchParams.get("select");

  useEffect(() => {
    if (selectId && users.length > 0) {
      const user = users.find(u => u.id === selectId);
      if (user) {
        setSelectedUser(user);
      }
    }
  }, [selectId, users]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (statusFilter !== "all" && u.status !== statusFilter) return false;
      if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.phone.includes(search)) return false;
      return true;
    });
  }, [search, roleFilter, statusFilter, users]);

  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, status, reason }: { userId: string; status: "Active" | "Deactivated"; reason?: string }) =>
      updateUserStatus(userId, status, reason),
    onSuccess: (_, variables) => {
      // Manually update the cache to prevent the list from shuffling
      queryClient.setQueryData(['users'], (oldData: User[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(u => 
          u.id === variables.userId ? { ...u, status: variables.status as any } : u
        );
      });
      
      toast.success(`User status updated to ${variables.status.toLowerCase()}`);

      if (selectedUser && selectedUser.id === variables.userId) {
        setSelectedUser({ ...selectedUser, status: variables.status as any });
      }
      setConfirmModalTarget(null);
      setStatusReason("");
    },
    onError: () => {
      toast.error("Failed to update user status");
    }
  });

  const initiateStatusChange = (user: User, newStatus: "Active" | "Deactivated", e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (user.id === "admin") {
      toast.error("System admin cannot be modified");
      return;
    }
    setConfirmModalTarget({ user, newStatus });
    setStatusReason("");
  };

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
          <h1 className="text-2xl font-heading font-bold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {roleFilter !== "all" ? `${roleFilter}s` : "All users"} on the platform
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name or phone..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Deactivated">Deactivated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-xl bg-card shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs">User</TableHead>
                  <TableHead className="text-xs">Phone</TableHead>
                  <TableHead className="text-xs">Role</TableHead>
                  <TableHead className="text-xs">District</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Created</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((user) => (
                  <TableRow key={user.id} className="cursor-pointer" onClick={() => setSelectedUser(user)}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div onClick={(e) => e.stopPropagation()}>
                          <ImagePreviewDialog image={user.avatar} className="h-8 w-8 rounded-full border border-border bg-muted object-cover" altText={user.name} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{user.phone}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${user.role === "Farmer" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}`}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{user.district}</TableCell>
                    <TableCell><StatusBadge status={user.status} /></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => setSelectedUser(user)}>
                              <Eye className="h-3.5 w-3.5" />
                              <span className="sr-only">View Profile</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>View Profile</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-7 w-7 ${user.status === 'Deactivated' ? 'text-success hover:text-success/80' : 'text-muted-foreground hover:text-destructive'} disabled:opacity-50`}
                              disabled={user.id === 'admin' || updateStatusMutation.isPending}
                              onClick={(e) => initiateStatusChange(user, user.status === "Deactivated" ? "Active" : "Deactivated", e)}
                            >
                              {user.status === "Deactivated" ? <UserCheck className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
                              <span className="sr-only">{user.status === "Deactivated" ? "Activate User" : "Deactivate User"}</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>{user.status === "Deactivated" ? "Activate User" : "Deactivate User"}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filtered.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              <p className="font-medium">No users found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="w-full sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-xl p-6">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-xl">User Profile</DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-6">
                <div className="flex items-center gap-4">
                  <ImagePreviewDialog image={selectedUser.avatar} className="h-16 w-16 rounded-full border border-border bg-muted object-cover" altText={selectedUser.name} />
                  <div>
                    <h3 className="font-heading font-semibold text-lg">{selectedUser.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                    <div className="flex gap-2 mt-1.5">
                      <StatusBadge status={selectedUser.status} />
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${selectedUser.role === "Farmer" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}`}>
                        {selectedUser.role}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Phone", value: selectedUser.phone },
                    { label: "District", value: selectedUser.district },
                    { label: "User ID", value: selectedUser.id },
                    { label: "Created", value: new Date(selectedUser.createdAt).toLocaleDateString() },
                    { label: "Assets", value: String(selectedUser.assetsCount) },
                    { label: "Bookings", value: String(selectedUser.bookingsCount) },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-medium mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>

                {selectedUser.role === "Provider" && (() => {
                  const providerAssets = allAssets.filter(a => a.ownerId === selectedUser.id);
                  return (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Package className="h-4 w-4 text-primary" />
                        <h4 className="font-heading font-semibold text-sm">Listed Assets ({providerAssets.length})</h4>
                      </div>
                      {providerAssets.length > 0 ? (
                        <div className="space-y-2">
                          {providerAssets.map(asset => (
                            <div
                              key={asset.id}
                              className="bg-muted/50 rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:bg-muted/80 transition-colors active:scale-[0.98]"
                              onClick={() => setSelectedAssetDetails(asset)}
                            >
                              <div onClick={(e) => e.stopPropagation()}>
                                <ImagePreviewDialog image={asset.image} className="w-12 h-12 rounded-md object-cover border border-border bg-background" altText={asset.name} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{asset.name}</p>
                                <p className="text-xs text-muted-foreground">{asset.category} · {asset.subCategory}</p>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-xs font-medium text-primary">{formatCurrency(asset.price)}/{asset.priceUnit}</span>
                                  <div className="flex items-center gap-0.5">
                                    <Star className="h-3 w-3 text-accent fill-accent" />
                                    <span className="text-xs">{asset.rating}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="shrink-0">
                                <StatusBadge status={asset.approvalStatus} />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No assets listed</p>
                      )}
                    </div>
                  );
                })()}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className={`flex-1 ${selectedUser.status === 'Deactivated' ? 'text-success border-success/30 hover:bg-success/10' : 'text-destructive border-destructive/30 hover:bg-destructive/10'} disabled:opacity-50`}
                    disabled={selectedUser.id === 'admin' || updateStatusMutation.isPending}
                    onClick={() => initiateStatusChange(selectedUser, selectedUser.status === "Deactivated" ? "Active" : "Deactivated")}
                  >
                    {selectedUser.status === "Deactivated" ? <UserCheck className="h-4 w-4 mr-1.5" /> : <UserX className="h-4 w-4 mr-1.5" />}
                    {selectedUser.status === "Deactivated" ? "Activate" : "Deactivate"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation & Reason Popup Dialog */}
      <Dialog open={!!confirmModalTarget} onOpenChange={(open) => !open && setConfirmModalTarget(null)}>
        <DialogContent className="sm:max-w-md rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl flex items-center gap-2">
              {confirmModalTarget?.newStatus === "Deactivated" && <UserX className="h-5 w-5 text-destructive" />}
              {confirmModalTarget?.newStatus === "Active" && <UserCheck className="h-5 w-5 text-success" />}
              {confirmModalTarget?.newStatus === "Deactivated" ? "Deactivate User Account" : "Reactivate User Account"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              {confirmModalTarget?.newStatus === "Active"
                ? `Are you sure you want to reactivate ${confirmModalTarget?.user.name}'s account?`
                : `Please enter the reason for deactivating ${confirmModalTarget?.user.name}.`}
            </DialogDescription>
          </DialogHeader>

          {confirmModalTarget && confirmModalTarget.newStatus !== "Active" && (
            <div className="space-y-2 my-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Reason for deactivating <span className="text-destructive">*</span>
              </label>
              <Textarea
                placeholder={`Enter detailed reason for deactivating this user...`}
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:justify-end mt-4">
            <Button variant="outline" onClick={() => setConfirmModalTarget(null)} disabled={updateStatusMutation.isPending}>
              Cancel
            </Button>
            <Button
              variant={confirmModalTarget?.newStatus === "Deactivated" ? "destructive" : "default"}
              className={confirmModalTarget?.newStatus === "Active" ? "bg-success hover:bg-success/90 text-success-foreground" : ""}
              disabled={updateStatusMutation.isPending || (confirmModalTarget?.newStatus !== "Active" && !statusReason.trim())}
              onClick={() => {
                if (!confirmModalTarget) return;
                updateStatusMutation.mutate({
                  userId: confirmModalTarget.user.id,
                  status: confirmModalTarget.newStatus,
                  reason: statusReason.trim()
                });
              }}
            >
              {updateStatusMutation.isPending ? "Updating..." : `Confirm ${confirmModalTarget?.newStatus === "Active" ? "Activation" : "Deactivation"}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AssetDetailsSheet
        asset={selectedAssetDetails}
        onClose={() => setSelectedAssetDetails(null)}
      />
    </AppLayout>
  );
};

export default UsersPage;
