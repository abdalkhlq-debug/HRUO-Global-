import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  Globe, 
  Linkedin, 
  Facebook, 
  Instagram, 
  Youtube, 
  MessageSquare, 
  Cpu, 
  Mail, 
  Search,
  ExternalLink,
  Save,
  ShieldCheck
} from "lucide-react";

export default function SystemSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("hruo_token");
      const res = await fetch("/api/settings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (keys: string[]) => {
    setSaving(true);
    try {
      const token = localStorage.getItem("hruo_token");
      const payload = keys.reduce((acc, key) => {
        acc[key] = settings[key] || "";
        return acc;
      }, {} as Record<string, string>);

      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success("Settings updated successfully");
      } else {
        toast.error("Failed to save settings");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const updateKey = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">System Settings</h2>
        <p className="text-muted-foreground">Global configuration for the HRUO platform.</p>
      </div>

      <Tabs defaultValue="social" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="ai">AI Settings</TabsTrigger>
          <TabsTrigger value="email">Email & Notifications</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="social" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <CardTitle>Social Media Links</CardTitle>
              </div>
              <CardDescription>Configure the social platform links used across the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { label: "Facebook URL", key: "social.facebook", icon: Facebook, placeholder: "https://facebook.com/..." },
                { label: "LinkedIn URL", key: "social.linkedin", icon: Linkedin, placeholder: "https://linkedin.com/company/..." },
                { label: "WhatsApp Number", key: "social.whatsapp", icon: MessageSquare, placeholder: "+966501234567" },
                { label: "Instagram URL", key: "social.instagram", icon: Instagram, placeholder: "https://instagram.com/..." },
                { label: "TikTok URL", key: "social.tiktok", icon: Globe, placeholder: "https://tiktok.com/@..." },
                { label: "YouTube URL", key: "social.youtube", icon: Youtube, placeholder: "https://youtube.com/..." },
              ].map((platform) => (
                <div key={platform.key} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <platform.icon className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor={platform.key}>{platform.label}</Label>
                  </div>
                  <Input 
                    id={platform.key} 
                    value={settings[platform.key] || ""} 
                    onChange={e => updateKey(platform.key, e.target.value)}
                    placeholder={platform.placeholder}
                  />
                  {settings[platform.key] && (
                    <a 
                      href={settings[platform.key]} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-xs text-blue-600 flex items-center gap-1 hover:underline"
                    >
                      Preview Link <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleSave(["social.facebook", "social.linkedin", "social.whatsapp", "social.instagram", "social.tiktok", "social.youtube"])}
                disabled={saving}
              >
                <Save className="mr-2 h-4 w-4" /> Save Social Links
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-primary" />
                <CardTitle>AI Configuration</CardTitle>
              </div>
              <CardDescription>Manage AI assistant behaviors and quote generation settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable AI Quote Builder</Label>
                  <p className="text-sm text-muted-foreground">
                    When enabled, the AI will automatically generate personalized quote responses
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Switch 
                    checked={settings["ai.enabled"] === "true"} 
                    onCheckedChange={val => updateKey("ai.enabled", val.toString())}
                  />
                  {settings["ai.enabled"] === "true" ? (
                    <Badge className="bg-green-500">AI Active</Badge>
                  ) : (
                    <Badge variant="destructive">AI Disabled</Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Model</Label>
                <Input value="GPT-4o Mini" readOnly className="bg-muted" />
                <p className="text-[10px] text-muted-foreground">Fixed to latest high-efficiency model</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="system-prompt">System Prompt</Label>
                <Textarea 
                  id="system-prompt"
                  className="min-h-[200px] font-mono text-sm"
                  value={settings["ai.quote_prompt"] || ""}
                  onChange={e => updateKey("ai.quote_prompt", e.target.value)}
                  placeholder="Enter the AI persona and instructions here..."
                />
              </div>

              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded text-blue-700 text-xs">
                <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Security Note</p>
                  <p>AI requests are only processed from approved backend IPs and authenticated sessions.</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSave(["ai.enabled", "ai.quote_prompt"])} disabled={saving}>
                <Save className="mr-2 h-4 w-4" /> Save AI Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <CardTitle>Email & Notifications</CardTitle>
              </div>
              <CardDescription>Configure global notification recipients.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quote-email">Quote Request Recipient</Label>
                <Input 
                  id="quote-email" 
                  type="email"
                  value={settings["email.quote_recipient"] || ""}
                  onChange={e => updateKey("email.quote_recipient", e.target.value)}
                  placeholder="admin@hruo.com"
                />
                <p className="text-xs text-muted-foreground">Receives all new quote requests</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-email">Support Ticket Recipient</Label>
                <Input 
                  id="support-email" 
                  type="email"
                  value={settings["email.support_recipient"] || ""}
                  onChange={e => updateKey("email.support_recipient", e.target.value)}
                  placeholder="support@hruo.com"
                />
                <p className="text-xs text-muted-foreground">Receives new support ticket notifications</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSave(["email.quote_recipient", "email.support_recipient"])} disabled={saving}>
                <Save className="mr-2 h-4 w-4" /> Save Email Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                <CardTitle>SEO Configuration</CardTitle>
              </div>
              <CardDescription>Manage how the platform appears in search engines.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo-title">Site Title</Label>
                <Input 
                  id="seo-title"
                  value={settings["seo.title"] || ""}
                  onChange={e => updateKey("seo.title", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="seo-desc">Meta Description</Label>
                  <span className={cn("text-[10px]", (settings["seo.description"]?.length || 0) > 160 ? "text-destructive" : "text-muted-foreground")}>
                    {settings["seo.description"]?.length || 0}/160
                  </span>
                </div>
                <Textarea 
                  id="seo-desc"
                  className="h-24"
                  value={settings["seo.description"] || ""}
                  onChange={e => updateKey("seo.description", e.target.value)}
                  maxLength={200}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seo-keys">Keywords</Label>
                <Textarea 
                  id="seo-keys"
                  placeholder="hcm, hr system, payroll, saas"
                  value={settings["seo.keywords"] || ""}
                  onChange={e => updateKey("seo.keywords", e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground">Comma-separated values</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSave(["seo.title", "seo.description", "seo.keywords"])} disabled={saving}>
                <Save className="mr-2 h-4 w-4" /> Save SEO Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
