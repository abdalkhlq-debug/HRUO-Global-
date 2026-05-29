import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import { Plus, Send, LifeBuoy, MessageSquare, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
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
  createdAt: string;
  messages?: Message[];
}

export default function TenantSupport() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [replyText, setReplyText] = useState("");

  const [newTicket, setNewTicket] = useState({
    subject: "",
    description: "",
    priority: "medium" as Ticket["priority"],
    category: "general"
  });

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("hruo_token");
      const res = await fetch("/api/support", {
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
      const res = await fetch(`/api/support/${ticket.id}`, {
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

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("hruo_token");
      const res = await fetch("/api/support", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newTicket)
      });
      if (res.ok) {
        const created = await res.json();
        toast.success("Ticket created successfully");
        setTickets([created, ...tickets]);
        setSelectedTicket(created);
        setShowNewDialog(false);
        setNewTicket({ subject: "", description: "", priority: "medium", category: "general" });
      }
    } catch (error) {
      toast.error("Failed to create ticket");
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    try {
      const token = localStorage.getItem("hruo_token");
      const res = await fetch(`/api/support/${selectedTicket.id}/messages`, {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open": return <Badge className="bg-blue-500">Open</Badge>;
      case "in_progress": return <Badge className="bg-yellow-500">In Progress</Badge>;
      case "resolved": return <Badge className="bg-green-500">Resolved</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low": return <Badge variant="outline">Low</Badge>;
      case "medium": return <Badge variant="secondary">Medium</Badge>;
      case "high": return <Badge className="bg-orange-500">High</Badge>;
      case "urgent": return <Badge variant="destructive">Urgent</Badge>;
      default: return <Badge variant="outline">{priority}</Badge>;
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] border rounded-lg bg-card overflow-hidden">
      {/* Left Panel */}
      <div className="w-80 flex-shrink-0 border-r flex flex-col">
        <div className="p-4 border-b space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Support</h2>
            <Button size="sm" onClick={() => setShowNewDialog(true)}>
              <Plus className="h-4 w-4 mr-1" /> New
            </Button>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {loading ? (
              [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 w-full" />)
            ) : tickets.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground px-4">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No tickets yet. Need help? Create one!</p>
              </div>
            ) : (
              tickets.map(ticket => (
                <div 
                  key={ticket.id}
                  onClick={() => selectTicket(ticket)}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50",
                    selectedTicket?.id === ticket.id ? "bg-muted border-primary/50 shadow-sm" : "bg-background"
                  )}
                >
                  <div className="font-medium text-sm truncate">{ticket.subject}</div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex gap-1">
                      {getStatusBadge(ticket.status)}
                    </div>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
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
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground gap-4">
            <div className="bg-primary/5 p-6 rounded-full">
              <LifeBuoy className="h-16 w-16 text-primary/40" />
            </div>
            <div className="space-y-2 max-w-sm">
              <h3 className="text-xl font-semibold text-foreground">How can we help?</h3>
              <p>Open a support ticket and our team will respond within 24 hours. We're here to assist with any technical or billing issues.</p>
            </div>
            <Button onClick={() => setShowNewDialog(true)}>Open a Ticket</Button>
          </div>
        ) : (
          <>
            <div className="p-4 border-b bg-background flex justify-between items-center">
              <div className="space-y-1">
                <h3 className="text-lg font-bold">{selectedTicket.subject}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {getStatusBadge(selectedTicket.status)}
                  {getPriorityBadge(selectedTicket.priority)}
                  <span className="text-xs">Category: {selectedTicket.category}</span>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="max-w-3xl mx-auto space-y-6 pb-4">
                {/* Initial Description */}
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white rounded-lg p-4 max-w-[85%] shadow-sm">
                    <div className="text-xs font-medium mb-1 opacity-80">You</div>
                    <div className="text-sm whitespace-pre-wrap">{selectedTicket.description}</div>
                    <div className="text-[10px] opacity-60 mt-2">
                      {format(new Date(selectedTicket.createdAt), "PPP p")}
                    </div>
                  </div>
                </div>

                {loadingDetails ? (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-[70%]" />
                    <Skeleton className="h-20 w-[60%] ml-auto" />
                  </div>
                ) : (
                  selectedTicket.messages?.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={cn("flex", !msg.fromAdmin ? "justify-end" : "justify-start")}
                    >
                      <div 
                        className={cn(
                          "rounded-lg p-4 max-w-[85%] shadow-sm",
                          !msg.fromAdmin ? "bg-blue-600 text-white" : "bg-white border"
                        )}
                      >
                        <div className={cn("text-xs font-medium mb-1", !msg.fromAdmin ? "text-blue-100" : "text-primary")}>
                          {msg.fromAdmin ? "HRUO Support" : "You"}
                        </div>
                        <div className="text-sm whitespace-pre-wrap">{msg.message}</div>
                        <div className={cn("text-[10px] mt-2", !msg.fromAdmin ? "text-blue-200" : "text-muted-foreground")}>
                          {format(new Date(msg.createdAt), "MMM d, h:mm a")}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {selectedTicket.status !== "resolved" && (
              <div className="p-4 border-t bg-background">
                <div className="max-w-3xl mx-auto flex gap-2">
                  <Textarea 
                    placeholder="Type your message..." 
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
            )}
          </>
        )}
      </div>

      {/* New Ticket Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Support Ticket</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input 
                id="subject" 
                required 
                value={newTicket.subject}
                onChange={e => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Brief summary of the issue"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select 
                  value={newTicket.priority} 
                  onValueChange={v => setNewTicket(prev => ({ ...prev, priority: v as Ticket["priority"] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={newTicket.category} 
                  onValueChange={v => setNewTicket(prev => ({ ...prev, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="hr-feature">HR Feature</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                required 
                rows={5}
                value={newTicket.description}
                onChange={e => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed explanation of your request..."
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
              <Button type="submit">Submit Ticket</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
