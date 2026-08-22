import { useState, useMemo, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Asset, formatCurrency } from "@/data/mockData";
import { fetchAssets, updateAssetApprovalStatus } from "@/lib/api";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, Eye, Star } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ImagePreviewDialog } from "@/components/shared/ImagePreviewDialog";
import { AssetDetailsSheet } from "@/components/shared/AssetDetailsSheet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";

const AssetModerationPage = () => {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category") || "all";
  const [search, setSearch] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const queryClient = useQueryClient();
  const { data: assets = [], isLoading } = useQuery({
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

  const updateApprovalMutation = useMutation({
    mutationFn: ({ assetId, category, status, reason }: { assetId: string; category: string; status: "Approved" | "Rejected"; reason?: string }) => 
      updateAssetApprovalStatus(assetId, category, status, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast({
        title: variables.status === "Approved" ? "Asset Activated" : "Asset Deactivated",
        description: `Asset has been ${variables.status === "Approved" ? "activated" : "deactivated"} successfully.`,
      });
      if (selectedAsset?.id === variables.assetId) {
        setSelectedAsset(prev => prev ? { 
          ...prev, 
          approvalStatus: variables.status,
          availability: variables.status === "Rejected" ? "Unavailable" : (prev.availability === "Unavailable" ? "Available" : prev.availability)
        } : null);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update asset approval status",
        variant: "destructive"
      });
    }
  });

  const handleApproval = (assetId: string, status: "Approved" | "Rejected", reason?: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;
    updateApprovalMutation.mutate({ assetId, category: asset.category, status, reason });
  };

  const categoryTitle = categoryFilter !== "all" ? categoryFilter : "All Assets";

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
          <h1 className="text-2xl font-heading font-bold text-foreground">Asset Moderation</h1>
          <p className="text-sm text-muted-foreground mt-1">{categoryTitle} — review and moderate platform assets</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search assets or owners..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={approvalFilter} onValueChange={setApprovalFilter}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Active</SelectItem>
              <SelectItem value="Rejected">Deactivated</SelectItem>
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
                  <TableHead className="text-xs">Status</TableHead>
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
                          {asset.category === "Worker Group" && (
                            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-medium">
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                👨 {asset.maleWorkersCount ?? 0} Male
                              </span>
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-600 dark:text-pink-400">
                                👩 {asset.femaleWorkersCount ?? 0} Female
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{asset.category}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div>{asset.subCategory}</div>
                      {asset.category === "Worker Group" && (
                        <div className="text-[11px] text-primary font-medium mt-0.5">
                          {(asset.maleWorkersCount || 0) + (asset.femaleWorkersCount || 0)} Total Workers
                        </div>
                      )}
                    </TableCell>
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
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => setSelectedAsset(asset)}>
                              <Eye className="h-3.5 w-3.5" />
                              <span className="sr-only">View Asset Details</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>View Asset Details</p>
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
