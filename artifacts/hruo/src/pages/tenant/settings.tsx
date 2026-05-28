import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Building, Bell, Shield, Wallet } from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your organization's preferences and configuration.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" /> Company Profile
            </CardTitle>
            <CardDescription>Update your company details and logo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground bg-muted p-4 rounded-md">
              Configuration options for company profile will be available here.
            </div>
            <Button variant="outline">Edit Profile</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" /> Notifications
            </CardTitle>
            <CardDescription>Configure email and system notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground bg-muted p-4 rounded-md">
              Notification preferences will be available here.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Security & Roles
            </CardTitle>
            <CardDescription>Manage access controls and permissions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground bg-muted p-4 rounded-md">
              Role-based access control settings will be available here.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" /> Subscription
            </CardTitle>
            <CardDescription>Manage your HRUO subscription and billing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 border rounded-md">
              <div>
                <p className="font-medium">Enterprise Plan</p>
                <p className="text-sm text-muted-foreground">Active until Dec 31, 2025</p>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
            <Button variant="outline">Manage Billing</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Quick component for Badge to avoid importing if not strictly necessary
function Badge({ children, variant = "default" }: { children: React.ReactNode, variant?: string }) {
  const base = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  const variants: Record<string, string> = {
    default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground",
  };
  return <div className={`${base} ${variants[variant]}`}>{children}</div>;
}