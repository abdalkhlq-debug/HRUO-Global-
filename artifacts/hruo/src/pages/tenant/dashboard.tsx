import { useGetDashboardAnalytics } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserMinus, Clock, CalendarDays, Banknote, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function TenantDashboard() {
  const { data: analytics, isLoading } = useGetDashboardAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground">Here's what's happening across your organization today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Headcount</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.employeeStats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.employeeStats.active} active • {analytics.employeeStats.newThisMonth} new this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave Today</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.employeeStats.onLeave}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.leaveStats.pendingRequests} requests pending approval
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.attendanceStats.presentToday}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Present today • {analytics.attendanceStats.absentToday} absent • {analytics.attendanceStats.lateToday} late
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Payroll (Gross)</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(analytics.payrollStats.totalGrossLastMonth || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Net: ${(analytics.payrollStats.totalNetLastMonth || 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Headcount by Department</CardTitle>
            <CardDescription>Current active employees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.employeeStats.departments?.map((dept, i) => (
                <div key={i} className="flex items-center">
                  <div className="w-[150px] text-sm truncate pr-4" title={dept.name}>{dept.name}</div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="h-2 bg-primary rounded-full" style={{ width: `${Math.max(5, (dept.count || 0) / analytics.employeeStats.total * 100)}%` }} />
                    <span className="text-sm font-medium w-8">{dept.count}</span>
                  </div>
                </div>
              ))}
              {(!analytics.employeeStats.departments || analytics.employeeStats.departments.length === 0) && (
                <div className="py-8 text-center text-muted-foreground text-sm border border-dashed rounded-md">
                  No department data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>Attention required</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.recentAlerts && analytics.recentAlerts.length > 0 ? (
                analytics.recentAlerts.map((alert, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">{alert.employeeName}</p>
                      <p className="text-muted-foreground">{alert.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground text-sm border border-dashed rounded-md">
                  No current alerts
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}