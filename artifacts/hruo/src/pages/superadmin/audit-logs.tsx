import { useListAuditLogs } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { useState } from "react";

export default function AuditLogs() {
  const { data: logs, isLoading } = useListAuditLogs();
  const [search, setSearch] = useState("");

  const filtered = logs?.filter(l =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.actorEmail.toLowerCase().includes(search.toLowerCase()) ||
    (l.details ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Audit Logs</h2>
          <p className="text-muted-foreground">System-wide security and activity monitoring.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search logs..."
            className="pl-8"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : filtered?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No audit logs found.</TableCell>
                </TableRow>
              ) : (
                filtered?.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {log.timestamp ? format(new Date(log.timestamp), "MMM d, yyyy HH:mm:ss") : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Activity className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{log.action}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{log.actorEmail}</div>
                    </TableCell>
                    <TableCell className="text-sm">{log.tenantId ? `Tenant #${log.tenantId}` : "System"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {log.details ?? "—"}
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
