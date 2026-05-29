import { useListQuoteRequests, useUpdateQuoteRequest } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Mail, Phone, Users, Sparkles, Loader2, Copy, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function Quotes() {
  const { data: quotes, refetch } = useListQuoteRequests();
  const updateQuote = useUpdateQuoteRequest();

  const [aiEnabled, setAiEnabled] = useState(false);
  const [selectedQuoteForAI, setSelectedQuoteForAI] = useState<number | null>(null);
  const [generatedText, setGeneratedText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [aiDialog, setAiDialog] = useState(false);
  const [customInstructions, setCustomInstructions] = useState("");
  const [generationSource, setGenerationSource] = useState<string>("");

  useEffect(() => {
    fetch("/api/ai-quote/status")
      .then(res => res.json())
      .then(data => setAiEnabled(data.enabled))
      .catch(() => setAiEnabled(false));
  }, []);

  const handleGenerateAI = async () => {
    if (!selectedQuoteForAI) return;
    setGenerating(true);
    try {
      const token = localStorage.getItem("hruo_token");
      const res = await fetch("/api/ai-quote/generate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ quoteId: selectedQuoteForAI, customInstructions })
      });
      const data = await res.json();
      setGeneratedText(data.text);
      setGenerationSource(data.source);
    } catch (e) {
      toast.error("Failed to generate quote");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    toast.success("Copied!");
  };

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
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground font-medium">AI Quote Builder:</span>
          <Badge className={aiEnabled ? "bg-green-500" : "bg-gray-400"}>
            {aiEnabled ? "Active" : "Disabled"}
          </Badge>
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
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-2"
                          onClick={() => {
                            setSelectedQuoteForAI(quote.id);
                            setAiDialog(true);
                            setGeneratedText("");
                          }}
                        >
                          <Sparkles className="h-4 w-4 text-blue-500" />
                          Generate AI Quote
                        </Button>
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

      <Dialog open={aiDialog} onOpenChange={setAiDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              AI Quote Generator
            </DialogTitle>
          </DialogHeader>

          {!aiEnabled && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex gap-3 text-amber-800 text-sm">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <p>AI is currently disabled. Enable it in System Settings.</p>
            </div>
          )}

          {selectedQuoteForAI && (
            <div className="space-y-6">
              {(() => {
                const quote = quotes?.find(q => q.id === selectedQuoteForAI);
                if (!quote) return null;
                return (
                  <Card className="bg-muted/30">
                    <CardContent className="p-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-semibold">{quote.companyName}</p>
                        <p className="text-muted-foreground">{quote.contactName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{quote.employeeCount} Employees</p>
                        <p className="text-muted-foreground">{(quote.modules || []).join(", ")}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}

              <div className="space-y-2">
                <label className="text-sm font-medium">Custom Instructions</label>
                <Textarea 
                  placeholder="Add any specific pricing notes, discount info, or special requirements..."
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  disabled={!aiEnabled}
                />
              </div>

              <Button 
                onClick={handleGenerateAI} 
                className="w-full" 
                disabled={generating || !aiEnabled}
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Generate Quote
              </Button>

              {generatedText && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary">
                      {generationSource === "ai" ? "Generated by AI" : "Generated from template"}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={handleCopy}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy to Clipboard
                    </Button>
                  </div>
                  <Textarea 
                    value={generatedText}
                    readOnly
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
