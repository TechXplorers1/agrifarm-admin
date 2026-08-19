import { useState, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Percent, ShieldCheck, Bell, Upload, RefreshCw, Save, Camera, Check } from "lucide-react";
import { getAdminProfile, saveAdminProfile } from "@/lib/adminProfile";
import { toast } from "sonner";

const SettingsPage = () => {
  const initialProfile = getAdminProfile();
  const [profile, setProfile] = useState(initialProfile);
  const [commissionRate, setCommissionRate] = useState("10");
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setProfile(prev => ({ ...prev, avatarUrl: reader.result as string }));
          toast.info("Profile photo updated. Click 'Save Changes' to apply.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const resetAvatarToInitials = () => {
    const newAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.name || "Admin")}&backgroundColor=2E7D32&textColor=ffffff`;
    setProfile(prev => ({ ...prev, avatarUrl: newAvatar }));
    toast.info("Avatar reset. Click 'Save Changes' to apply.");
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveAdminProfile(profile);
    setIsSaved(true);
    toast.success("Admin profile updated successfully!");
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleCommissionSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Platform commission rate updated to ${commissionRate}%`);
  };

  const initials = profile.name ? profile.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "AD";

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage platform configuration and preferences</p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-primary" />
              <CardTitle className="font-heading text-base">Admin Profile</CardTitle>
            </div>
            <CardDescription>Manage your admin account details and profile picture</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <form onSubmit={handleProfileSave} className="space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-muted/40 p-4 rounded-xl border border-border">
                <div className="relative group shrink-0">
                  <Avatar className="h-20 w-20 border-2 border-primary/20 shadow-sm">
                    <AvatarImage src={profile.avatarUrl} alt={profile.name} className="object-cover" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">{initials}</AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Change Photo"
                  >
                    <Camera className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-2 flex-1 min-w-0">
                  <div>
                    <h3 className="font-heading font-semibold text-lg leading-tight truncate">{profile.name}</h3>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                    <span className="inline-block text-xs font-medium bg-primary/10 text-primary px-2.5 py-0.5 rounded-full mt-1">
                      {profile.role}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1.5"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-3.5 w-3.5" /> Change Photo
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                      onClick={resetAvatarToInitials}
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Reset Avatar
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Full Name</Label>
                  <Input
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Email Address</Label>
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="admin@agrifarms.in"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Phone Number</Label>
                  <Input
                    value={profile.phone}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Phone number"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Admin Role / Title</Label>
                  <Input
                    value={profile.role}
                    onChange={(e) => setProfile(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="Super Admin"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5">
                  {isSaved ? <Check className="h-4 w-4 text-white" /> : <Save className="h-4 w-4" />}
                  {isSaved ? "Saved!" : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Percent className="h-4.5 w-4.5 text-primary" />
              <CardTitle className="font-heading text-base">Platform Commission</CardTitle>
            </div>
            <CardDescription>Set the commission fee applied to all bookings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleCommissionSave} className="space-y-4">
              <div className="space-y-1.5 max-w-xs">
                <Label className="text-xs font-semibold">Commission Rate (%)</Label>
                <Input
                  type="number"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  min="0"
                  max="50"
                />
                <p className="text-xs text-muted-foreground">Applied to every completed booking transaction</p>
              </div>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Update Rate
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-primary" />
              <CardTitle className="font-heading text-base">Approval Rules</CardTitle>
            </div>
            <CardDescription>Configure asset approval workflows</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Auto-approve verified providers", desc: "Assets from verified providers skip manual review", defaultChecked: false },
              { label: "Require image uploads", desc: "All assets must include at least one image", defaultChecked: true },
              { label: "Mandatory pricing", desc: "Reject assets without pricing information", defaultChecked: true },
            ].map(({ label, desc, defaultChecked }) => (
              <div key={label} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <Switch 
                  defaultChecked={defaultChecked} 
                  onCheckedChange={(checked) => toast.info(`${label}: ${checked ? "Enabled" : "Disabled"}`)} 
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-4.5 w-4.5 text-primary" />
              <CardTitle className="font-heading text-base">Notifications</CardTitle>
            </div>
            <CardDescription>Manage notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "New user registrations", desc: "Get notified when new users sign up", defaultChecked: true },
              { label: "Pending asset approvals", desc: "Alert when new assets need review", defaultChecked: true },
              { label: "Booking disputes", desc: "Notify on booking cancellations or disputes", defaultChecked: true },
              { label: "Weekly summary report", desc: "Receive weekly platform performance report", defaultChecked: false },
            ].map(({ label, desc, defaultChecked }) => (
              <div key={label} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <Switch 
                  defaultChecked={defaultChecked} 
                  onCheckedChange={(checked) => toast.info(`${label}: ${checked ? "Enabled" : "Disabled"}`)} 
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
