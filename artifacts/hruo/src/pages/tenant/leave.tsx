import { useState } from "react";
import { useListLeaveRequests, useGetLeaveBalances, useApproveLeaveRequest } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, CheckCircle, XCircle, FileText, CheckSquare, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

const CHART_COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#F97316"];

export default function LeaveManagement() {
  const { data: requests, refetch: refetchRequests } = useListLeaveRequests();
  const { data: balances } = useGetLeaveBalances(0);
  const approveLeave = useApproveLeaveRequest();

  const handleAction = async (id: number, action: "approve" | "reject") => {
    try {
      await approveLeave.mutateAsync({ id, data: { action } });
      toast.success(`Leave request ${action}d successfully`);
      refetchRequests();
    } catch (error: any) {
      toast.error(`Failed to ${action} request`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "approved": return <Badge className="bg-green-500">Approved</Badge>;
      case "rejected": return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="secondary">Pending</Badge>;
    }
  };

  // Analytics derivation
  const leaveRequestsByStatus = requests ? Object.values(requests.reduce((acc: any, req) => {
    const status = req.status || "pending";
    if (!acc[status]) acc[status] = { name: status, count: 0 };
    acc[status].count += 1;
    return acc;
  }, {})) : [];

  const requestsByLeaveType = requests ? Object.values(requests.reduce((acc: any, req) => {
    const type = req.leaveTypeName || "Unknown";
    if (!acc[type]) acc[type] = { name: type, value: 0 };
    acc[type].value += 1;
    return acc;
  }, {})) : [];

  const totalRequests = requests?.length || 0;
  const approvedRequests = requests?.filter(r => r.status === "approved").length || 0;
  const pendingRequests = requests?.filter(r => r.status === "pending").length || 0;
  const totalDaysTaken = requests?.filter(r => r.status === "approved").reduce((acc, r) => acc + (Number(r.days) || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Leave Management</h2>
        <p className="text-muted-foreground">Manage your time off and team requests.</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {balances?.map((balance) => (
              <Card key={balance.leaveTypeId}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{balance.leaveTypeName}</CardTitle>
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{balance.remaining} <span className="text-sm font-normal text-muted-foreground">days left</span></div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {balance.taken} days taken of {balance.entitled}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Leave Requests</CardTitle>
              <CardDescription>Recent leave requests from your team.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No leave requests found.</TableCell>
                    </TableRow>
                  ) : (
                    requests?.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-medium">{req.employeeName}</TableCell>
                        <TableCell>{req.leaveTypeName}</TableCell>
                        <TableCell>
                          {format(new Date(req.startDate), "MMM d, yyyy")} - {format(new Date(req.endDate), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>{req.days}</TableCell>
                        <TableCell>{getStatusBadge(req.status)}</TableCell>
                        <TableCell className="text-right">
                          {req.status === "pending" && (
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-green-600 border-green-600 hover:bg-green-50" onClick={() => handleAction(req.id, "approve")}>
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 border-red-600 hover:bg-red-50" onClick={() => handleAction(req.id, "reject")}>
                                <XCircle className="h-4 w-4" />
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
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalRequests}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{approvedRequests}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingRequests}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Days Taken</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalDaysTaken}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Leave Requests by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={leaveRequestsByStatus}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" className="capitalize" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Requests by Leave Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={requestsByLeaveType}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {requestsByLeaveType.map((_, index) => (
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
