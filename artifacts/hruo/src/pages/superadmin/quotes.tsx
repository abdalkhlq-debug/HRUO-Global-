import { useListQuoteRequests, useUpdateQuoteRequest } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Mail, Phone, Users } from "lucide-react";

export default function Quotes() {
  const { data: quotes, refetch } = useListQuoteRequests();
  const updateQuote = useUpdateQuoteRequest();

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateQuote.mutateAsync({ id, data: { status } });
      toast.success("Quote status updated");
      refetch();
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new": return <Badge className="bg-blue-500">New Request</Badge>;
      case "contacted": return <Badge variant="secondary">Contacted</Badge>;
      case "quoted": return <Badge variant="outline" className="border-green-500 text-green-600">Proposal Sent</Badge>;
      case "closed": return <Badge variant="secondary" className="opacity-50">Closed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quote Requests</h2>
          <p className="text-muted-foreground">Inbound leads and enterprise inquiries.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {quotes?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg bg-card">
            No quote requests found.
          </div>
        ) : (
          quotes?.map((quote) => (
            <Card key={quote.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          {quote.companyName}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-4">
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {quote.employeeCount} employees</span>
                          <span>Submitted {quote.createdAt ? formatDistanceToNow(new Date(quote.createdAt), { addSuffix: true }) : ""}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        {getStatusBadge(quote.status)}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleStatusChange(quote.id, "new")}>Mark as New</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(quote.id, "contacted")}>Mark as Contacted</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(quote.id, "quoted")}>Mark as Quoted</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(quote.id, "closed")}>Close Lead</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-2">
                      <div className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded-md">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{quote.contactName}</span>
                        <a href={`mailto:${quote.email}`} className="text-primary hover:underline">{quote.email}</a>
                      </div>
                      <div className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded-md">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${quote.phone}`} className="text-foreground hover:underline">{quote.phone}</a>
                      </div>
                    </div>

                    <div className="pt-2">
                      <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Requested Modules</p>
                      <div className="flex flex-wrap gap-2">
                        {quote.modules?.map((mod, i) => (
                          <Badge key={i} variant="outline" className="bg-background">{mod}</Badge>
                        ))}
                      </div>
                    </div>

                    {quote.message && (
                      <div className="bg-muted/30 p-4 rounded-lg border text-sm mt-4 italic">
                        "{quote.message}"
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}