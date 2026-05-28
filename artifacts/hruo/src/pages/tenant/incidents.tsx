import { useListIncidents } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Plus, Eye } from "lucide-react";
import { format } from "date-fns";

export default function Incidents() {
  const { data: incidents } = useListIncidents();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Incidents</h2>
          <p className="text-muted-foreground">Manage workplace incidents and disciplinary actions.</p>
        </div>
        <Button variant="destructive"><Plus className="mr-2 h-4 w-4" /> Log Incident</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Incident Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">No incidents found.</TableCell>
                </TableRow>
              ) : (
                incidents?.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell>{incident.date ? format(new Date(incident.date), "MMM d, yyyy") : "-"}</TableCell>
                    <TableCell className="font-medium">{incident.employeeName}</TableCell>
                    <TableCell><Badge variant="outline">{incident.type}</Badge></TableCell>
                    <TableCell className="max-w-[200px] truncate" title={incident.description || ""}>{incident.description}</TableCell>
                    <TableCell>{incident.actionTaken || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={incident.status === "closed" ? "default" : incident.status === "approved" ? "secondary" : "destructive"}>
                        {incident.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
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