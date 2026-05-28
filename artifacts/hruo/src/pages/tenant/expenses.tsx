import { useListExpenseClaims, useApproveExpenseClaim } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Expenses</h2>
          <p className="text-muted-foreground">Manage and approve employee expense claims.</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" /> New Claim</Button>
      </div>

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
    </div>
  );
}