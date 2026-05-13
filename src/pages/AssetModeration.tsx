import { useState, useMemo, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Asset, formatCurrency } from "@/data/mockData";
import { fetchAssets } from "@/lib/api";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, Eye, CheckCircle, XCircle, Star, MapPin, User, Calendar } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ImagePreviewDialog } from "@/components/shared/ImagePreviewDialog";
import { AssetDetailsSheet } from "@/components/shared/AssetDetailsSheet";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const AssetModerationPage = () => {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category") || "all";
  const [search, setSearch] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const queryClient = useQueryClient();
  const { data: assets = [] } = useQuery({
    queryKey: ['assets'],
    queryFn: fetchAssets,
    staleTime: 60000,
    refetchInterval: 10000,
  });

  const selectId = searchParams.get("select");

  useEffect(() => {
    if (selectId && assets.length > 0) {
      const asset = assets.find(a => a.id === selectId);
      if (asset) {
        setSelectedAsset(asset);
      }
    }
  }, [selectId, assets]);

  const { toast } = useToast();

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      if (categoryFilter !== "all" && a.category !== categoryFilter) return false;
      if (approvalFilter !== "all" && a.approvalStatus !== approvalFilter) return false;
      if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.owner.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, categoryFilter, approvalFilter, assets]);

  const handleApproval = (assetId: string, status: "Approved" | "Rejected") => {
    queryClient.setQueryData<Asset[]>(["assets"], (old) => 
      old?.map(a => a.id === assetId ? { ...a, approvalStatus: status } : a) ?? []
    );
    if (selectedAsset?.id === assetId) setSelectedAsset((prev) => prev ? { ...prev, approvalStatus: status } : null);
    toast({
      title: status === "Approved" ? "Asset Approved" : "Asset Rejected",
      description: `Asset has been ${status.toLowerCase()} successfully.`,
    });
  };

  const categoryTitle = categoryFilter !== "all" ? categoryFilter : "All Assets";

  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Asset Moderation</h1>
          <p className="text-sm text-muted-foreground mt-1">{categoryTitle} — review and moderate platform assets</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search assets or owners..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={approvalFilter} onValueChange={setApprovalFilter}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Approval Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-xl bg-card shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs">Asset</TableHead>
                  <TableHead className="text-xs">Category</TableHead>
                  <TableHead className="text-xs">Sub Category</TableHead>
                  <TableHead className="text-xs">Owner</TableHead>
                  <TableHead className="text-xs">Price</TableHead>
                  <TableHead className="text-xs">Location</TableHead>
                  <TableHead className="text-xs">Availability</TableHead>
                  <TableHead className="text-xs">Rating</TableHead>
                  <TableHead className="text-xs">Approval</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((asset) => (
                  <TableRow key={asset.id} className="cursor-pointer" onClick={() => setSelectedAsset(asset)}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div onClick={(e) => e.stopPropagation()}>
                           <ImagePreviewDialog image={asset.image} className="w-10 h-10 rounded-md object-cover border bg-muted" altText={asset.name} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{asset.name}</p>
                          <p className="text-xs text-muted-foreground">{asset.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{asset.category}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{asset.subCategory}</TableCell>
                    <TableCell className="text-sm">{asset.owner}</TableCell>
                    <TableCell className="text-sm font-medium">{formatCurrency(asset.price)}<span className="text-xs text-muted-foreground ml-1">/{asset.priceUnit}</span></TableCell>
                    <TableCell className="text-sm">{asset.location}</TableCell>
                    <TableCell><StatusBadge status={asset.availability} /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-accent fill-accent" />
                        <span className="text-sm">{asset.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell><StatusBadge status={asset.approvalStatus} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => setSelectedAsset(asset)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-success" onClick={() => handleApproval(asset.id, "Approved")}>
                          <CheckCircle className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleApproval(asset.id, "Rejected")}>
                          <XCircle className="h-3.5 w-3.5" />
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
              <p className="font-medium">No assets found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      <AssetDetailsSheet 
        asset={selectedAsset} 
        onClose={() => setSelectedAsset(null)} 
        onApprovalUpdate={handleApproval} 
      />
    </AppLayout>
  );
};

export default AssetModerationPage;
