import { useState, useMemo, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Asset, User, formatCurrency } from "@/data/mockData";
import { fetchUsers, fetchAssets } from "@/lib/api";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, Eye, UserX, Ban, Star, Package } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const UsersPage = () => {
  const [searchParams] = useSearchParams();
  const roleFilter = searchParams.get("role") || "all";
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [allAssets, setAllAssets] = useState<Asset[]>([]);

  useEffect(() => {
    const loadData = () => {
      fetchUsers().then(setUsers);
      fetchAssets().then(setAllAssets);
    };

    loadData();
    const interval = setInterval(loadData, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (statusFilter !== "all" && u.status !== statusFilter) return false;
      if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.phone.includes(search)) return false;
      return true;
    });
  }, [search, roleFilter, statusFilter]);

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
              <SelectItem value="Suspended">Suspended</SelectItem>
              <SelectItem value="Banned">Banned</SelectItem>
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
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">{user.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                        </Avatar>
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
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => setSelectedUser(user)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-warning">
                          <UserX className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                          <Ban className="h-3.5 w-3.5" />
                        </Button>
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

      <Sheet open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selectedUser && (
            <>
              <SheetHeader>
                <SheetTitle className="font-heading">User Profile</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedUser.avatar} />
                    <AvatarFallback className="text-lg bg-primary/10 text-primary">{selectedUser.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                  </Avatar>
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
                            <div key={asset.id} className="bg-muted/50 rounded-lg p-3 flex items-center gap-3">
                              <span className="text-2xl">{asset.image}</span>
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
                  <Button variant="outline" className="flex-1 text-warning border-warning/30 hover:bg-warning/10">
                    <UserX className="h-4 w-4 mr-1.5" /> Suspend
                  </Button>
                  <Button variant="outline" className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10">
                    <Ban className="h-4 w-4 mr-1.5" /> Ban
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
};

export default UsersPage;
