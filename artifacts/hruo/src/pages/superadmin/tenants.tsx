import { useListTenants } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";

export default function TenantsList() {
  const { data: tenants, isLoading } = useListTenants();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-green-500">Active</Badge>;
      case "trial": return <Badge variant="secondary">Trial</Badge>;
      case "pending": return <Badge variant="outline">Pending</Badge>;
      case "suspended": return <Badge variant="destructive">Suspended</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tenants</h2>
          <p className="text-muted-foreground">Manage organizational accounts and subscriptions.</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" /> Add Tenant</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : tenants?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No tenants found.</TableCell>
                </TableRow>
              ) : (
                tenants?.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-md">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{tenant.name}</div>
                          <div className="text-xs text-muted-foreground">{tenant.contactEmail}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{tenant.slug}</TableCell>
                    <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                    <TableCell>{tenant.employeeCount}</TableCell>
                    <TableCell>{tenant.createdAt ? format(new Date(tenant.createdAt), "MMM d, yyyy") : "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
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