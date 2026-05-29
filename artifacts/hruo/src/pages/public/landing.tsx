import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, Users, Calendar, Banknote, Briefcase, ChevronRight, ShieldCheck, Zap, 
  Check, Facebook, Linkedin, Instagram, Youtube, Music, MessageCircle, Globe, ExternalLink, Camera, Play, Link as LinkIcon
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Landing() {
  const [plans, setPlans] = useState<any[]>([]);
  const [social, setSocial] = useState<any>(null);

  useEffect(() => {
    fetch("/api/subscriptions/plans")
      .then(res => res.json())
      .then(data => setPlans(data.filter((p: any) => p.name !== "Custom")))
      .catch(() => setPlans([]));

    fetch("/api/settings/social")
      .then(res => res.json())
      .then(data => setSocial(data))
      .catch(() => setSocial(null));
  }, []);

  const socialLinks = [
    { id: "facebook", label: "Facebook", icon: Globe, url: social?.facebook },
    { id: "linkedin", label: "LinkedIn", icon: LinkIcon, url: social?.linkedin },
    { id: "instagram", label: "Instagram", icon: Camera, url: social?.instagram },
    { id: "youtube", label: "YouTube", icon: Play, url: social?.youtube },
    { id: "tiktok", label: "TikTok", icon: Music, url: social?.tiktok },
    { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, url: social?.whatsapp },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/hruo-logo.png" alt="HRUO Logo" className="h-8" />
            <span className="font-bold text-xl tracking-tight hidden sm:inline-block">HRUO</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/request-quote">
              <Button>Request Quote</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-24 md:py-32 lg:py-48 bg-grid-black/[0.02] relative overflow-hidden">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="space-y-4 max-w-3xl">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                  Enterprise HCM, <br/>
                  <span className="text-primary">Engineered for Precision</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  The complete human capital management platform for complex workforces. Dense with information, fast to navigate, and completely trustworthy.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/request-quote">
                  <Button size="lg" className="h-12 px-8">
                    Request a Quote
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="h-12 px-8">
                    Sign In to Workspace
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-16 md:py-24 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Everything you need to manage your workforce</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-lg">
                No fluff. Just the essential tools you need to run your organization efficiently.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                {
                  title: "Core HR",
                  description: "Centralized employee database, org charts, and document management.",
                  icon: Users,
                },
                {
                  title: "Time & Attendance",
                  description: "Clock-ins, geofencing, leave requests, and shift scheduling.",
                  icon: Calendar,
                },
                {
                  title: "Multi-country Payroll",
                  description: "Automated tax calculations, salary processing, and payslip generation.",
                  icon: Banknote,
                },
                {
                  title: "Talent Acquisition",
                  description: "Job postings, Kanban-style applicant tracking, and interview management.",
                  icon: Briefcase,
                },
                {
                  title: "Enterprise Grade",
                  description: "Role-based access control, audit logs, and secure data encryption.",
                  icon: ShieldCheck,
                },
                {
                  title: "Lightning Fast",
                  description: "Optimized for speed. No waiting for pages to load. Get work done faster.",
                  icon: Zap,
                },
              ].map((feature, i) => (
                <Card key={i} className="bg-background border-border/50">
                  <CardHeader>
                    <feature.icon className="h-10 w-10 text-primary mb-2" />
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-24 md:py-32">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple, Transparent Pricing</h2>
              <p className="text-muted-foreground md:text-lg">Choose the plan that fits your team</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan) => (
                <Card key={plan.id} className={`relative flex flex-col ${plan.isPopular ? "border-primary shadow-lg scale-105" : ""}`}>
                  {plan.isPopular && (
                    <Badge className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 px-3 py-1">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-4xl font-bold">${plan.priceMonthly}</span>
                      <span className="text-muted-foreground">/mo</span>
                    </div>
                    <CardDescription className="mt-2">
                      billed annually ${plan.priceYearly}/yr
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-3 text-sm">
                      {(plan.features || []).slice(0, 6).map((feature: string, i: number) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <div className="p-6 pt-0 mt-auto">
                    <Link href="/request-quote">
                      <Button className="w-full" variant={plan.isPopular ? "default" : "outline"}>
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t bg-muted/30">
        <div className="container py-12 px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-6 text-center">
            <h3 className="text-lg font-semibold">Follow Us</h3>
            <div className="flex flex-wrap justify-center gap-6">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                const hasUrl = !!link.url && link.url !== "";
                return (
                  <a
                    key={link.id}
                    href={hasUrl ? link.url : "#"}
                    target={hasUrl ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Icon className="h-5 w-5" />
                    <span>{link.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
          <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <img src="/hruo-logo.png" alt="HRUO Logo" className="h-5 opacity-80 grayscale" />
              <p>© 2025 HRUO Enterprise Systems. All rights reserved.</p>
            </div>
            <div className="flex gap-6">
              <Link href="#" className="hover:underline">Terms</Link>
              <Link href="#" className="hover:underline">Privacy</Link>
              <Link href="#" className="hover:underline">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
