import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import { Search, Send, Clock, AlertTriangle, CheckCircle2, LifeBuoy } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  message: string;
  fromAdmin: boolean;
  createdAt: string;
}

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: "open" | "in_progress" | "resolved";
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  tenantId: string;
  tenantName: string;
  createdAt: string;
  messages?: Message[];
}

export default function SupportDesk() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("hruo_token");
      const res = await fetch("/api/support/admin/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTickets(data);
    } catch (error) {
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const selectTicket = async (ticket: Ticket) => {
    setLoadingDetails(true);
    try {
      const token = localStorage.getItem("hruo_token");
      const res = await fetch(`/api/support/admin/${ticket.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSelectedTicket(data);
    } catch (error) {
      toast.error("Failed to load ticket details");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedTicket) return;
    try {
      const token = localStorage.getItem("hruo_token");
      const res = await fetch(`/api/support/admin/${selectedTicket.id}/status`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success("Status updated");
        const updatedTicket = { ...selectedTicket, status: status as Ticket["status"] };
        setSelectedTicket(updatedTicket);
        setTickets(tickets.map(t => t.id === selectedTicket.id ? updatedTicket : t));
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    try {
      const token = localStorage.getItem("hruo_token");
      const res = await fetch(`/api/support/admin/${selectedTicket.id}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: replyText })
      });
      if (res.ok) {
        toast.success("Reply sent");
        setReplyText("");
        selectTicket(selectedTicket);
      }
    } catch (error) {
      toast.error("Failed to send reply");
    }
  };

  const filteredTickets = tickets.filter(t => 
    statusFilter === "all" || t.status === statusFilter
  );

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low": return <Badge variant="secondary" className="bg-gray-100 text-gray-700">Low</Badge>;
      case "medium": return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Medium</Badge>;
      case "high": return <Badge variant="secondary" className="bg-orange-100 text-orange-700">High</Badge>;
      case "urgent": return <Badge variant="destructive">Urgent</Badge>;
      default: return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open": return <Badge className="bg-blue-500">Open</Badge>;
      case "in_progress": return <Badge className="bg-yellow-500">In Progress</Badge>;
      case "resolved": return <Badge className="bg-green-500">Resolved</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === "open").length,
    inProgress: tickets.filter(t => t.status === "in_progress").length,
  };

  return (
    <div className="flex h-[calc(100vh-120px)] border rounded-lg bg-card overflow-hidden">
      {/* Left Panel */}
      <div className="w-80 flex-shrink-0 border-r flex flex-col">
        <div className="p-4 border-b space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Support Desk</h2>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">{stats.total} Total</Badge>
            <Badge className="bg-blue-500">{stats.open} Open</Badge>
            <Badge className="bg-yellow-500">{stats.inProgress} In-Progress</Badge>
          </div>
          <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="open" className="text-xs">Open</TabsTrigger>
              <TabsTrigger value="in_progress" className="text-xs">IP</TabsTrigger>
              <TabsTrigger value="resolved" className="text-xs">Res</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-24 w-full" />)
            ) : filteredTickets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No tickets found</div>
            ) : (
              filteredTickets.map(ticket => (
                <div 
                  key={ticket.id}
                  onClick={() => selectTicket(ticket)}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50",
                    selectedTicket?.id === ticket.id ? "bg-muted border-primary/50 shadow-sm" : "bg-background"
                  )}
                >
                  <div className="font-medium truncate">{ticket.subject}</div>
                  <div className="text-sm text-muted-foreground truncate">{ticket.tenantName}</div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex gap-1">
                      {getPriorityBadge(ticket.priority)}
                      {getStatusBadge(ticket.status)}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {format(new Date(ticket.createdAt), "MMM d")}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col bg-muted/20">
        {!selectedTicket ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
            <LifeBuoy className="h-12 w-12 opacity-20" />
            <p>Select a ticket to view conversation</p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b bg-background flex justify-between items-center">
              <div className="space-y-1">
                <h3 className="text-lg font-bold">{selectedTicket.subject}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{selectedTicket.tenantName}</span>
                  <span>•</span>
                  <Badge variant="outline">{selectedTicket.category}</Badge>
                  {getPriorityBadge(selectedTicket.priority)}
                </div>
              </div>
              <Select defaultValue={selectedTicket.status} onValueChange={handleUpdateStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="max-w-3xl mx-auto space-y-6 pb-4">
                {/* Description - Initial Message */}
                <div className="flex justify-start">
                  <div className="bg-white border rounded-lg p-4 max-w-[85%] shadow-sm">
                    <div className="text-sm font-medium mb-1">{selectedTicket.tenantName}</div>
                    <div className="text-sm whitespace-pre-wrap">{selectedTicket.description}</div>
                    <div className="text-[10px] text-muted-foreground mt-2">
                      {format(new Date(selectedTicket.createdAt), "PPP p")}
                    </div>
                  </div>
                </div>

                {loadingDetails ? (
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-[60%] ml-auto" />
                    <Skeleton className="h-16 w-[70%]" />
                  </div>
                ) : (
                  selectedTicket.messages?.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={cn("flex", msg.fromAdmin ? "justify-end" : "justify-start")}
                    >
                      <div 
                        className={cn(
                          "rounded-lg p-4 max-w-[85%] shadow-sm",
                          msg.fromAdmin ? "bg-blue-600 text-white" : "bg-white border"
                        )}
                      >
                        <div className={cn("text-xs font-medium mb-1", msg.fromAdmin ? "text-blue-100" : "text-muted-foreground")}>
                          {msg.senderName}
                        </div>
                        <div className="text-sm whitespace-pre-wrap">{msg.message}</div>
                        <div className={cn("text-[10px] mt-2", msg.fromAdmin ? "text-blue-200" : "text-muted-foreground")}>
                          {format(new Date(msg.createdAt), "MMM d, h:mm a")}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t bg-background">
              <div className="max-w-3xl mx-auto flex gap-2">
                <Textarea 
                  placeholder="Type your reply..." 
                  className="resize-none h-20"
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                />
                <Button 
                  className="h-20 w-20 flex-shrink-0" 
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
