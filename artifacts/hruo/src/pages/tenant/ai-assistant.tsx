import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User, Building2, CalendarDays, FileText } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const SUGGESTIONS = [
  "What is the company leave policy?",
  "How do I request a new laptop?",
  "Show me upcoming holidays.",
  "What are the core working hours?",
];

const CANNED_RESPONSES: Record<string, string> = {
  "leave policy": "Our leave policy includes 21 days of annual paid time off (PTO), 7 days of sick leave, and up to 5 days of compassionate leave. All requests must be submitted through the Leave module at least 14 days in advance for PTO.",
  "laptop": "To request new hardware, please submit an IT equipment request form found in the Documents module, and have it approved by your direct manager. Delivery typically takes 3-5 business days.",
  "holidays": "The upcoming company holidays are: \n- Independence Day (July 4) \n- Labor Day (September 2) \n- Thanksgiving (November 28) \n- Winter Break (Dec 24-25)",
  "working hours": "Core working hours are 10:00 AM to 4:00 PM in your local timezone. Employees are expected to be online and available for meetings during these hours. You have flexibility for the remainder of your 8-hour workday.",
  "default": "I'm your HRUO AI assistant. I can help answer questions about company policies, direct you to the right forms, or help you navigate the system. This is a demo response, but in a full implementation, I would be connected to your company's knowledge base."
};

export default function AIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `Hello ${user?.name?.split(' ')[0] || 'there'}! I'm your HRUO AI Assistant. How can I help you today?`
    }
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate AI thinking and response
    setTimeout(() => {
      let responseContent = CANNED_RESPONSES.default;
      const lowerText = text.toLowerCase();
      
      for (const [key, value] of Object.entries(CANNED_RESPONSES)) {
        if (key !== "default" && lowerText.includes(key)) {
          responseContent = value;
          break;
        }
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseContent,
      };

      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h2 className="text-2xl font-bold tracking-tight">AI Assistant</h2>
        <p className="text-muted-foreground">Ask questions about policies, procedures, and system navigation.</p>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        <Card className="flex-1 flex flex-col shadow-sm border-border">
          <CardHeader className="border-b py-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">HRUO Assistant</CardTitle>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500 inline-block"></span> Online
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${
                      message.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      {message.role === "user" ? (
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {user?.name?.substring(0, 2).toUpperCase() || "U"}
                        </AvatarFallback>
                      ) : (
                        <AvatarFallback className="bg-sidebar-accent text-foreground border">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] whitespace-pre-wrap ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-4 border-t border-border mt-auto">
            <form
              className="flex w-full items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
            >
              <Input
                placeholder="Type your question here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!input.trim()}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </CardFooter>
        </Card>

        <div className="hidden lg:flex w-80 flex-col gap-4 overflow-y-auto">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium">Suggested Questions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {SUGGESTIONS.map((suggestion, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="justify-start text-left h-auto py-2 px-3 text-sm font-normal whitespace-normal"
                  onClick={() => handleSend(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 px-2">
              <Button variant="ghost" className="justify-start px-2 py-1 h-8 text-sm text-muted-foreground hover:text-foreground">
                <FileText className="mr-2 h-4 w-4" /> Employee Handbook
              </Button>
              <Button variant="ghost" className="justify-start px-2 py-1 h-8 text-sm text-muted-foreground hover:text-foreground">
                <Building2 className="mr-2 h-4 w-4" /> Office Locations
              </Button>
              <Button variant="ghost" className="justify-start px-2 py-1 h-8 text-sm text-muted-foreground hover:text-foreground">
                <CalendarDays className="mr-2 h-4 w-4" /> 2025 Holiday Calendar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}