import { useListExpenseClaims, useApproveExpenseClaim } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, X, FileText, CheckCircle, Clock, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

const CHART_COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#F97316"];

export default function Expenses() {
  const { data: claims, refetch } = useListExpenseClaims();
  const approveClaim = useApproveExpenseClaim();

  const handleApprove = async (id: number) => {
    try {
      await approveClaim.mutateAsync({ id, data: { action: "approve" } });
      toast.success("Expense claim approved");
      refetch();
    } catch (error) {
      toast.error("Failed to approve claim");
    }
  };

  const handleReject = async (id: number) => {
    try {
      await approveClaim.mutateAsync({ id, data: { action: "reject" } });
      toast.success("Expense claim rejected");
      refetch();
    } catch (error) {
      toast.error("Failed to reject claim");
    }
  };

  // Analytics derivation
  const claimsByStatus = claims ? Object.values(claims.reduce((acc: any, claim) => {
    const status = claim.status || "pending";
    if (!acc[status]) acc[status] = { name: status, value: 0 };
    acc[status].value += 1;
    return acc;
  }, {})) : [];

  const amountByStatus = claims ? Object.values(claims.reduce((acc: any, claim) => {
    const status = claim.status || "pending";
    if (!acc[status]) acc[status] = { name: status, amount: 0 };
    acc[status].amount += Number(claim.amount) || 0;
    return acc;
  }, {})) : [];

  const totalClaims = claims?.length || 0;
  const approvedAmount = claims?.filter(c => c.status === "approved").reduce((acc, c) => acc + (Number(c.amount) || 0), 0) || 0;
  const pendingAmount = claims?.filter(c => c.status === "pending").reduce((acc, c) => acc + (Number(c.amount) || 0), 0) || 0;
  const rejectedCount = claims?.filter(c => c.status === "rejected").length || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Expenses</h2>
          <p className="text-muted-foreground">Manage and approve employee expense claims.</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" /> New Claim</Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {claims?.filter(c => c.status === "pending").length || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Pending Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${claims?.filter(c => c.status === "pending").reduce((acc, c) => acc + c.amount, 0).toLocaleString() || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Approved This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${claims?.filter(c => c.status === "approved").reduce((acc, c) => acc + c.amount, 0).toLocaleString() || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Expense Claims</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claims?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">No expense claims found.</TableCell>
                    </TableRow>
                  ) : (
                    claims?.map((claim) => (
                      <TableRow key={claim.id}>
                        <TableCell>{claim.submittedAt ? format(new Date(claim.submittedAt), "MMM d, yyyy") : "-"}</TableCell>
                        <TableCell className="font-medium">{claim.employeeName}</TableCell>
                        <TableCell>{claim.categoryName}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={claim.reason || ""}>{claim.reason}</TableCell>
                        <TableCell className="text-right font-medium">{claim.currency} {claim.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={claim.status === "approved" ? "default" : claim.status === "rejected" ? "destructive" : "secondary"}>
                            {claim.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {claim.status === "pending" && (
                            <div className="flex justify-end gap-2">
                              <Button size="icon" variant="outline" className="h-8 w-8 text-green-600 border-green-600 hover:bg-green-50" onClick={() => handleApprove(claim.id)}>
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="outline" className="h-8 w-8 text-red-600 border-red-600 hover:bg-red-50" onClick={() => handleReject(claim.id)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalClaims}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved Amount</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">${approvedAmount.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">${pendingAmount.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                <X className="h-4 w-4 text-muted-foreground text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{rejectedCount}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Claims by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={claimsByStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {claimsByStatus.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
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
                <CardTitle>Amount by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={amountByStatus}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" className="capitalize" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="amount" fill="#2563EB" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
