import { useState } from "react";
import { useListPayslips, useGetPayrollSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Plus, DollarSign } from "lucide-react";
import { format } from "date-fns";

export default function Payroll() {
  const { data: payslips, isLoading } = useListPayslips();
  const { data: summary } = useGetPayrollSummary();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payroll</h2>
          <p className="text-muted-foreground">Manage employee compensation and payslips.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Run Payroll</Button>
          <Button><Plus className="h-4 w-4 mr-2" /> Create Payslip</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gross</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(summary?.totalGross || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Current Period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Net</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${(summary?.totalNet || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxes & Deductions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              ${((summary?.totalTax || 0) + (summary?.totalDeductions || 0)).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employees Paid</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalEmployees || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Payslips</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Gross</TableHead>
                <TableHead className="text-right">Net</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">Loading...</TableCell>
                </TableRow>
              ) : payslips?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No payslips found.</TableCell>
                </TableRow>
              ) : (
                payslips?.map((slip) => (
                  <TableRow key={slip.id}>
                    <TableCell className="font-medium">{slip.employeeName}</TableCell>
                    <TableCell>{slip.period}</TableCell>
                    <TableCell className="text-right">{slip.currency} {slip.grossSalary.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-medium">{slip.currency} {slip.netSalary.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={slip.status === "published" ? "default" : "secondary"}>
                        {slip.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
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