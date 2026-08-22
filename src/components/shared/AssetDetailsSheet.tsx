import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Star, MapPin, User, Calendar, Users } from "lucide-react";
import { Asset, formatCurrency } from "@/data/mockData";
import { StatusBadge } from "./StatusBadge";
import { ImagePreviewDialog } from "./ImagePreviewDialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface AssetDetailsSheetProps {
  asset: Asset | null;
  onClose: () => void;
  onApprovalUpdate?: (assetId: string, status: "Approved" | "Rejected", reason?: string) => void; 
}

export function AssetDetailsSheet({ asset, onClose, onApprovalUpdate }: AssetDetailsSheetProps) {
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState("");

  const handleApproval = (status: "Approved" | "Rejected", reason?: string) => {
    if (!asset || !onApprovalUpdate) return;
    onApprovalUpdate(asset.id, status, reason);
    if (status === "Rejected") {
      setShowDeactivateDialog(false);
      setDeactivateReason("");
    }
  };

  return (
    <>
    <Dialog open={!!asset} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-xl p-6">
        {asset && (
          <>
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">Asset Details</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-6">
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

              {/* Worker Group Male & Female Count Breakdown */}
              {asset.category === "Worker Group" && (
                <div className="bg-muted/50 rounded-xl p-4 border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-heading font-semibold text-sm flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" /> Worker Distribution
                    </h4>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                      Total: {(asset.maleWorkersCount || 0) + (asset.femaleWorkersCount || 0)} Workers
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-background rounded-lg p-3 border border-border/60 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-base shrink-0">
                        👨
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Male Workers</p>
                        <p className="text-lg font-bold text-foreground">{asset.maleWorkersCount ?? 0}</p>
                      </div>
                    </div>

                    <div className="bg-background rounded-lg p-3 border border-border/60 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold text-base shrink-0">
                        👩
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Female Workers</p>
                        <p className="text-lg font-bold text-foreground">{asset.femaleWorkersCount ?? 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: User, label: "Owner", value: asset.owner },
                  { icon: MapPin, label: "Location", value: asset.location },
                  { icon: MapPin, label: "Service Area", value: asset.serviceArea },
                  { icon: Calendar, label: "Created", value: new Date(asset.createdAt).toLocaleDateString() },
                  ...(asset.category === "Worker Group" ? [
                    { icon: Users, label: "Male Workers", value: `${asset.maleWorkersCount ?? 0} Workers` },
                    { icon: Users, label: "Female Workers", value: `${asset.femaleWorkersCount ?? 0} Workers` },
                  ] : []),
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
                  <CheckCircle className="h-4 w-4 mr-1.5" /> Activate
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => setShowDeactivateDialog(true)}
                  disabled={asset.approvalStatus === "Rejected"}
                >
                  <XCircle className="h-4 w-4 mr-1.5" /> Deactivate
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>

    <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Deactivate Asset</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for deactivation</Label>
            <Textarea
              id="reason"
              placeholder="Enter reason for deactivating this asset..."
              value={deactivateReason}
              onChange={(e) => setDeactivateReason(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setShowDeactivateDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => handleApproval("Rejected", deactivateReason)}
            disabled={!deactivateReason.trim()}
          >
            Confirm Deactivation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
