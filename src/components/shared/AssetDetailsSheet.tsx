import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Star, MapPin, User, Calendar, ArrowLeft } from "lucide-react";
import { Asset, formatCurrency } from "@/data/mockData";
import { StatusBadge } from "./StatusBadge";
import { ImagePreviewDialog } from "./ImagePreviewDialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { updateAssetApprovalStatus } from "@/lib/api";

interface AssetDetailsSheetProps {
  asset: Asset | null;
  onClose: () => void;
  // If provided, handles state updates locally, otherwise the component handles global state
  onApprovalUpdate?: (assetId: string, status: "Approved" | "Rejected") => void; 
}

export function AssetDetailsSheet({ asset, onClose, onApprovalUpdate }: AssetDetailsSheetProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateApprovalMutation = useMutation({
    mutationFn: ({ assetId, category, status }: { assetId: string; category: string; status: "Approved" | "Rejected" }) => 
      updateAssetApprovalStatus(assetId, category, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast({
        title: variables.status === "Approved" ? "Asset Approved" : "Asset Rejected",
        description: `Asset has been ${variables.status.toLowerCase()} successfully.`,
      });
      if (onApprovalUpdate) {
        onApprovalUpdate(variables.assetId, variables.status);
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

  const handleApproval = (status: "Approved" | "Rejected") => {
    if (!asset) return;
    updateApprovalMutation.mutate({ assetId: asset.id, category: asset.category, status });
  };

  return (
    <Sheet open={!!asset} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        {asset && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full -ml-2 text-muted-foreground hover:text-foreground"
                  onClick={onClose}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Back</span>
                </Button>
                <SheetTitle className="font-heading">Asset Details</SheetTitle>
              </div>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-20 w-20 rounded-xl bg-muted/50 flex items-center justify-center shrink-0 overflow-hidden border border-border">
                  <ImagePreviewDialog image={asset.image} className="h-full w-full object-cover" altText={asset.name} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-heading font-semibold text-lg leading-snug">{asset.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <StatusBadge status={asset.approvalStatus} />
                    <StatusBadge status={asset.availability} />
                  </div>
                  <div className="flex items-center gap-1 mt-1.5">
                    <Star className="h-3.5 w-3.5 text-accent fill-accent" />
                    <span className="text-sm font-medium">{asset.rating}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">{asset.description}</p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: User, label: "Owner", value: asset.owner },
                  { icon: MapPin, label: "Location", value: asset.location },
                  { icon: MapPin, label: "Service Area", value: asset.serviceArea },
                  { icon: Calendar, label: "Created", value: new Date(asset.createdAt).toLocaleDateString() },
                  ...(asset.brand ? [{ icon: Star, label: "Brand / Model", value: `${asset.brand} ${asset.model || ""}` }] : []),
                  { icon: Star, label: "Operator", value: asset.operatorAvailable ? "Available" : "Not included" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Icon className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                    <p className="text-sm font-medium">{value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs text-muted-foreground">Pricing</p>
                <p className="text-xl font-heading font-bold text-primary mt-1">{formatCurrency(asset.price)}</p>
                <p className="text-xs text-muted-foreground">{asset.priceUnit}</p>
              </div>

              <div className="sticky bottom-0 bg-card pt-4 pb-2 border-t border-border flex gap-3">
                <Button
                  className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                  onClick={() => handleApproval("Approved")}
                  disabled={asset.approvalStatus === "Approved"}
                >
                  <CheckCircle className="h-4 w-4 mr-1.5" /> Approve
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleApproval("Rejected")}
                  disabled={asset.approvalStatus === "Rejected"}
                >
                  <XCircle className="h-4 w-4 mr-1.5" /> Reject
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
