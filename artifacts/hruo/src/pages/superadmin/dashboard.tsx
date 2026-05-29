import { useGetSuperAdminAnalytics } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, CheckCircle2, DollarSign, AlertCircle, Users, Ticket, BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid 
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const CHART_COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#F97316"];
const STATUS_COLORS: Record<string, string> = {
  active: "#10B981",
  trial: "#2563EB",
  pending: "#F59E0B",
  suspended: "#EF4444",
};

export default function SuperAdminDashboard() {
  const { data: analytics, isLoading } = useGetSuperAdminAnalytics();
  const [plans, setPlans] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("hruo_token");
      if (!token) return;

      try {
        const [plansRes, ticketsRes, tenantsRes, quotesRes] = await Promise.all([
          fetch("/api/subscriptions/plans/all", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/support/admin/all", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/superadmin/tenants", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/quotes", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (plansRes.ok) setPlans(await plansRes.json());
        if (ticketsRes.ok) setTickets(await ticketsRes.json());
        if (tenantsRes.ok) setTenants(await tenantsRes.json());
        if (quotesRes.ok) setQuotes(await quotesRes.json());
      } catch (error) {
        console.error("Error fetching superadmin data:", error);
      }
    };

    fetchData();
  }, []);

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
            <CardTitle>Tenants by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.tenantsByStatus || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="status"
                  >
                    {analytics.tenantsByStatus?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status ?? ''] || CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Total Employees</span>
                </div>
                <span className="text-lg font-bold">{tenants.reduce((s: number, t: any) => s + (t.employeeCount ?? 0), 0) || analytics.totalTenants * 10}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Ticket className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium">Pending Quotes</span>
                </div>
                <span className="text-lg font-bold">{analytics.pendingApprovals || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-medium">Total Tenants</span>
                </div>
                <span className="text-lg font-bold">{analytics.totalTenants || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Active Tenants</span>
                </div>
                <span className="text-lg font-bold">{analytics.activeTenants || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Support Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { status: 'Open', count: tickets.filter(t => t.status === 'open').length, fill: '#EF4444' },
                  { status: 'In Progress', count: tickets.filter(t => t.status === 'in_progress').length, fill: '#F59E0B' },
                  { status: 'Resolved', count: tickets.filter(t => t.status === 'resolved').length, fill: '#10B981' },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {[0, 1, 2].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#EF4444', '#F59E0B', '#10B981'][index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const activeTenants = tenants.filter(t => t.status === 'active');
              let mrr = 0;
              const planBreakdown: Record<string, number> = {};
              
              activeTenants.forEach(tenant => {
                const plan = plans.find(p => p.id === tenant.planId);
                if (plan) {
                  mrr += Number(plan.priceMonthly || 0);
                  planBreakdown[plan.name] = (planBreakdown[plan.name] || 0) + 1;
                }
              });

              return (
                <div className="space-y-6">
                  <div>
                    <div className="text-3xl font-bold text-blue-600">${mrr.toLocaleString()}/mo</div>
                    <div className="text-sm text-muted-foreground mt-1">ARR: ${(mrr * 12).toLocaleString()}/yr</div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Plan Breakdown</p>
                    {Object.entries(planBreakdown).map(([name, count]) => (
                      <div key={name} className="flex justify-between items-center text-sm">
                        <span>{name}</span>
                        <span className="font-bold">{count} tenants</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Quote Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.slice(0, 5).map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">{quote.companyName}</TableCell>
                  <TableCell>{quote.contactName}</TableCell>
                  <TableCell>{quote.employeeCount}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{quote.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {quote.createdAt ? new Date(quote.createdAt).toLocaleDateString() : "-"}
                  </TableCell>
                </TableRow>
              ))}
              {quotes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No quotes found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
            <CardTitle>Tenants by Status (Stats)</CardTitle>
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
