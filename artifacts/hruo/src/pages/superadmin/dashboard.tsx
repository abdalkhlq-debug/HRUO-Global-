import { useGetSuperAdminAnalytics } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, CheckCircle2, DollarSign, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SuperAdminDashboard() {
  const { data: analytics, isLoading } = useGetSuperAdminAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">System Overview</h2>
        <p className="text-muted-foreground">Platform-wide statistics and metrics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalTenants}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.activeTenants} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeTenants}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently subscribed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.pendingApprovals ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Quote requests awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(analytics.totalRevenue ?? 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All-time platform revenue
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.recentActivity && analytics.recentActivity.length > 0 ? (
                analytics.recentActivity.map((activity, i) => (
                  <div key={i} className="flex flex-col gap-1 border-b pb-3 last:border-0 last:pb-0">
                    <span className="text-sm font-medium">{activity.action}</span>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{activity.tenantName}</span>
                      <span>{activity.timestamp ? new Date(activity.timestamp).toLocaleDateString() : ""}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">No recent activity</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tenants by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.tenantsByStatus?.map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{s.status}</span>
                  <span className="text-sm font-medium">{s.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
