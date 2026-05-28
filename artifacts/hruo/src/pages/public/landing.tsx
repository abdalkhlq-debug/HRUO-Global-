import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Calendar, Banknote, Briefcase, ChevronRight, ShieldCheck, Zap } from "lucide-react";

export default function Landing() {
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
      </main>

      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 md:h-16">
          <div className="flex items-center gap-2">
            <img src="/hruo-logo.png" alt="HRUO Logo" className="h-5 opacity-80 grayscale" />
            <p className="text-sm text-muted-foreground">
              © 2025 HRUO Enterprise Systems. All rights reserved.
            </p>
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:underline">Terms</Link>
            <Link href="#" className="hover:underline">Privacy</Link>
            <Link href="#" className="hover:underline">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}