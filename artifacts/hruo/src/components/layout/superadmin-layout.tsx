import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard,
  Building2,
  Inbox,
  Activity,
  LogOut,
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
  { name: "Dashboard", href: "/superadmin", icon: LayoutDashboard },
  { name: "Tenants", href: "/superadmin/tenants", icon: Building2 },
  { name: "Quote Requests", href: "/superadmin/quotes", icon: Inbox },
  { name: "Audit Logs", href: "/superadmin/audit-logs", icon: Activity },
];

export function SuperAdminLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <Sidebar className="border-r border-border bg-sidebar">
          <SidebarHeader className="flex h-14 items-center px-4 border-b border-sidebar-border">
            <Link href="/superadmin" className="flex items-center gap-2">
              <img src="/hruo-logo.png" alt="HRUO Logo" className="h-6 w-auto" />
              <span className="font-semibold text-lg text-sidebar-foreground">Super Admin</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="px-2 py-4">
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.href || (item.href !== "/superadmin" && location.startsWith(item.href))}
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
                      SA
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-sm truncate flex-1">
                    <span className="font-medium truncate w-full">{user?.name || "Super Admin"}</span>
                    <span className="text-xs text-sidebar-foreground/60 truncate w-full">{user?.email}</span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
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
                {navigation.find((n) => location === n.href || (n.href !== "/superadmin" && location.startsWith(n.href)))?.name || "Dashboard"}
              </h1>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            <div className="mx-auto max-w-7xl w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}