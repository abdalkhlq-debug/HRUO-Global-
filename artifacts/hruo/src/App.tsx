import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/components/layout/protected-route";
import { TenantLayout } from "@/components/layout/tenant-layout";
import { SuperAdminLayout } from "@/components/layout/superadmin-layout";

import NotFound from "@/pages/not-found";
import Landing from "@/pages/public/landing";
import Login from "@/pages/public/login";
import RequestQuote from "@/pages/public/request-quote";

// Tenant Pages
import TenantDashboard from "@/pages/tenant/dashboard";
import EmployeesList from "@/pages/tenant/employees/index";
import EmployeeProfile from "@/pages/tenant/employees/[id]";
import EmployeeForm from "@/pages/tenant/employees/new";
import LeaveManagement from "@/pages/tenant/leave";
import Attendance from "@/pages/tenant/attendance";
import Payroll from "@/pages/tenant/payroll";
import Recruitment from "@/pages/tenant/recruitment";
import Expenses from "@/pages/tenant/expenses";
import Performance from "@/pages/tenant/performance";
import Training from "@/pages/tenant/training";
import Documents from "@/pages/tenant/documents";
import Tasks from "@/pages/tenant/tasks";
import Discussions from "@/pages/tenant/discussions";
import Announcements from "@/pages/tenant/announcements";
import Incidents from "@/pages/tenant/incidents";
import TaxCalculator from "@/pages/tenant/tax-calculator";
import Org from "@/pages/tenant/org";
import Settings from "@/pages/tenant/settings";
import AIAssistant from "@/pages/tenant/ai-assistant";
import TenantSupport from "@/pages/tenant/support";

// Super Admin Pages
import SuperAdminDashboard from "@/pages/superadmin/dashboard";
import TenantsList from "@/pages/superadmin/tenants";
import QuotesList from "@/pages/superadmin/quotes";
import AuditLogs from "@/pages/superadmin/audit-logs";
import Subscriptions from "@/pages/superadmin/subscriptions";
import UserManagement from "@/pages/superadmin/users";
import SupportDesk from "@/pages/superadmin/support";
import SystemSettings from "@/pages/superadmin/system-settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/request-quote" component={RequestQuote} />

      {/* Super Admin Routes */}
      <Route path="/superadmin*">
        <ProtectedRoute requireSuperAdmin>
          <SuperAdminLayout>
            <Switch>
              <Route path="/superadmin" component={SuperAdminDashboard} />
              <Route path="/superadmin/tenants" component={TenantsList} />
              <Route path="/superadmin/quotes" component={QuotesList} />
              <Route path="/superadmin/audit-logs" component={AuditLogs} />
              <Route path="/superadmin/subscriptions" component={Subscriptions} />
              <Route path="/superadmin/users" component={UserManagement} />
              <Route path="/superadmin/support" component={SupportDesk} />
              <Route path="/superadmin/system-settings" component={SystemSettings} />
              <Route component={NotFound} />
            </Switch>
          </SuperAdminLayout>
        </ProtectedRoute>
      </Route>

      {/* Tenant Routes */}
      <Route path="/*">
        <ProtectedRoute>
          <TenantLayout>
            <Switch>
              <Route path="/dashboard" component={TenantDashboard} />

              <Route path="/employees/new" component={EmployeeForm} />
              <Route path="/employees/:id" component={EmployeeProfile} />
              <Route path="/employees" component={EmployeesList} />

              <Route path="/leave" component={LeaveManagement} />
              <Route path="/attendance" component={Attendance} />
              <Route path="/payroll" component={Payroll} />
              <Route path="/recruitment" component={Recruitment} />
              <Route path="/expenses" component={Expenses} />
              <Route path="/performance" component={Performance} />
              <Route path="/training" component={Training} />
              <Route path="/documents" component={Documents} />
              <Route path="/tasks" component={Tasks} />
              <Route path="/discussions" component={Discussions} />
              <Route path="/announcements" component={Announcements} />
              <Route path="/incidents" component={Incidents} />
              <Route path="/tax-calculator" component={TaxCalculator} />
              <Route path="/org" component={Org} />
              <Route path="/ai-assistant" component={AIAssistant} />
              <Route path="/support" component={TenantSupport} />
              <Route path="/settings" component={Settings} />
              <Route component={NotFound} />
            </Switch>
          </TenantLayout>
        </ProtectedRoute>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
