import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Percent, ShieldCheck, Bell } from "lucide-react";

const SettingsPage = () => {
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
            <CardDescription>Manage your admin account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="https://api.dicebear.com/7.x/initials/svg?seed=Admin&backgroundColor=2E7D32&textColor=ffffff" />
                <AvatarFallback className="bg-primary text-primary-foreground">AD</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">Super Admin</p>
                <p className="text-sm text-muted-foreground">admin@agrifarms.in</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Full Name</Label>
                <Input defaultValue="Admin User" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Email</Label>
                <Input defaultValue="admin@agrifarms.in" />
              </div>
            </div>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Save Changes</Button>
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
            <div className="space-y-1.5 max-w-xs">
              <Label className="text-xs">Commission Rate (%)</Label>
              <Input type="number" defaultValue="10" min="0" max="50" />
              <p className="text-xs text-muted-foreground">Applied to every completed booking transaction</p>
            </div>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Update Rate</Button>
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
                <Switch defaultChecked={defaultChecked} />
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
                <Switch defaultChecked={defaultChecked} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
