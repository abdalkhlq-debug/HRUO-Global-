import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Clock,
  Banknote,
  Briefcase,
  Receipt,
  Target,
  GraduationCap,
  Files,
  CheckSquare,
  MessageSquare,
  Bell,
  AlertTriangle,
  Calculator,
  Network,
  Settings,
  Bot,
  LogOut,
  LifeBuoy,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigation = [
  { name: "Dashboard",     href: "/dashboard",      icon: LayoutDashboard },
  { name: "Employees",     href: "/employees",      icon: Users },
  { name: "Leave",         href: "/leave",          icon: CalendarDays },
  { name: "Attendance",    href: "/attendance",     icon: Clock },
  { name: "Payroll",       href: "/payroll",        icon: Banknote },
  { name: "Recruitment",   href: "/recruitment",    icon: Briefcase },
  { name: "Expenses",      href: "/expenses",       icon: Receipt },
  { name: "Performance",   href: "/performance",    icon: Target },
  { name: "Training",      href: "/training",       icon: GraduationCap },
  { name: "Documents",     href: "/documents",      icon: Files },
  { name: "Tasks",         href: "/tasks",          icon: CheckSquare },
  { name: "Discussions",   href: "/discussions",    icon: MessageSquare },
  { name: "Announcements", href: "/announcements",  icon: Bell },
  { name: "Incidents",     href: "/incidents",      icon: AlertTriangle },
  { name: "Tax Calculator",href: "/tax-calculator", icon: Calculator },
  { name: "Org Chart",     href: "/org",            icon: Network },
  { name: "AI Assistant",  href: "/ai-assistant",   icon: Bot },
  { name: "Support",       href: "/support",        icon: LifeBuoy },
  { name: "Settings",      href: "/settings",       icon: Settings },
];

export function TenantLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <Sidebar className="border-r border-border bg-sidebar">
          <SidebarHeader className="flex h-14 items-center justify-between px-4 border-b border-sidebar-border">
            <Link href="/dashboard" className="flex items-center gap-2">
              <img src="/hruo-logo.png" alt="HRUO Logo" className="h-6 w-auto" />
              <span className="font-semibold text-lg text-sidebar-foreground truncate max-w-[120px]">
                {user?.tenantName || "HRUO"}
              </span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="px-2 py-2">
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.startsWith(item.href)}
                    tooltip={item.name}
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t border-sidebar-border p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-2 rounded-md p-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {user?.name?.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-sm truncate flex-1">
                    <span className="font-medium truncate w-full">{user?.name}</span>
                    <span className="text-xs text-sidebar-foreground/60 truncate w-full">{user?.role}</span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onSelect={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-2" />
              <h1 className="text-lg font-medium hidden sm:block">
                {navigation.find((n) => location.startsWith(n.href))?.name || "Dashboard"}
              </h1>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            <div className="mx-auto max-w-7xl w-full">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
