import { useState } from "react";
import { useListLeaveRequests, useGetLeaveBalances, useCreateLeaveRequest, useListLeaveTypes, useApproveLeaveRequest } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Leave Management</h2>
        <p className="text-muted-foreground">Manage your time off and team requests.</p>
      </div>

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
    </div>
  );
}