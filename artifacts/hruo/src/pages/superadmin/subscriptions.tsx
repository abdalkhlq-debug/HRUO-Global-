import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { Plus, Edit2, Shield, Users, UserCog, Check } from "lucide-react";

const COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#F97316"];

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  maxEmployees: number;
  maxHrUsers: number;
  maxAdminUsers: number;
  isPopular: boolean;
  active: boolean;
  modules: string[];
  features: string[];
}

interface Tenant {
  id: string;
  name: string;
  status: string;
  planId: string;
  employeeCount: number;
  maxEmployees?: number;
  maxHrUsers?: number;
  maxAdminUsers?: number;
}

const AVAILABLE_MODULES = [
  "employees", "leave", "attendance", "payroll", "recruitment", "expenses",
  "performance", "training", "collaboration", "analytics", "ai-assistant", "tax-calculator"
];

export default function SubscriptionsManagement() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("plans");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showLimitsDialog, setShowLimitsDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Partial<Plan> | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem("hruo_token");
      const [plansRes, tenantsRes] = await Promise.all([
        fetch("/api/subscriptions/plans/all", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/superadmin/tenants", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const plansData = await plansRes.json();
      const tenantsData = await tenantsRes.json();
      setPlans(plansData);
      setTenants(tenantsData);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    try {
      const token = localStorage.getItem("hruo_token");
      const method = editingPlan.id ? "PATCH" : "POST";
      const url = editingPlan.id ? `/api/subscriptions/plans/${editingPlan.id}` : "/api/subscriptions/plans";
      
      const res = await fetch(url, {
        method,
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(editingPlan)
      });

      if (res.ok) {
        toast.success("Plan saved successfully");
        setShowEditDialog(false);
        fetchInitialData();
      } else {
        toast.error("Failed to save plan");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleUpdateTenantPlan = async (tenantId: string, planId: string) => {
    try {
      const token = localStorage.getItem("hruo_token");
      const res = await fetch(`/api/subscriptions/tenants/${tenantId}/plan`, {
        method: "PATCH",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ planId })
      });

      if (res.ok) {
        toast.success("Tenant plan updated");
        fetchInitialData();
      } else {
        toast.error("Failed to update tenant plan");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleUpdateLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;

    try {
      const token = localStorage.getItem("hruo_token");
      const res = await fetch(`/api/subscriptions/tenants/${selectedTenant.id}/limits`, {
        method: "PATCH",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          maxEmployees: selectedTenant.maxEmployees,
          maxHrUsers: selectedTenant.maxHrUsers,
          maxAdminUsers: selectedTenant.maxAdminUsers,
        })
      });

      if (res.ok) {
        toast.success("Limits updated successfully");
        setShowLimitsDialog(false);
        fetchInitialData();
      } else {
        toast.error("Failed to update limits");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const revenueStats = useMemo(() => {
    const activeTenants = tenants.filter(t => t.status === "active");
    const mrr = activeTenants.reduce((sum, tenant) => {
      const plan = plans.find(p => p.id === tenant.planId);
      return sum + (plan?.priceMonthly || 0);
    }, 0);

    return {
      mrr,
      arr: mrr * 12,
      activeSubscribers: activeTenants.length,
      arpt: activeTenants.length > 0 ? mrr / activeTenants.length : 0
    };
  }, [plans, tenants]);

  const distributionData = useMemo(() => {
    return plans.map(plan => ({
      name: plan.name,
      value: tenants.filter(t => t.planId === plan.id).length
    })).filter(d => d.value > 0);
  }, [plans, tenants]);

  const mrrByPlanData = useMemo(() => {
    return plans.map(plan => {
      const tenantCount = tenants.filter(t => t.planId === plan.id && t.status === "active").length;
      return {
        name: plan.name,
        mrr: tenantCount * plan.priceMonthly
      };
    }).filter(d => d.mrr > 0);
  }, [plans, tenants]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Subscription Plans</h2>
          <p className="text-muted-foreground">Manage plans and tenant subscriptions</p>
        </div>
        <Button onClick={() => {
          setEditingPlan({
            name: "", slug: "", description: "", priceMonthly: 0, priceYearly: 0, 
            currency: "USD", maxEmployees: 0, maxHrUsers: 0, maxAdminUsers: 0,
            isPopular: false, active: true, modules: [], features: []
          });
          setShowEditDialog(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> New Plan
        </Button>
      </div>

      <Tabs defaultValue="plans" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="tenants">Tenant Assignments</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    {plan.isPopular && <Badge className="bg-blue-600">Most Popular</Badge>}
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold">${plan.priceMonthly}/mo</span>
                    <span className="text-sm text-muted-foreground ml-2 line-through">${plan.priceYearly}/yr</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Max Employees</span>
                      <span className="font-semibold">{plan.maxEmployees}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Max HR Users</span>
                      <span className="font-semibold">{plan.maxHrUsers}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Max Admins</span>
                      <span className="font-semibold">{plan.maxAdminUsers}</span>
                    </div>
                  </div>
                  <Badge variant={plan.active ? "default" : "secondary"}>
                    {plan.active ? "Active" : "Inactive"}
                  </Badge>
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase text-muted-foreground">Key Features</p>
                    <ul className="text-sm space-y-1">
                      {plan.features.slice(0, 3).map((f, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-500" /> {f}
                        </li>
                      ))}
                      {plan.features.length > 3 && (
                        <li className="text-xs text-muted-foreground">... +{plan.features.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                </CardContent>
                <div className="p-6 pt-0 mt-auto">
                  <Button variant="outline" className="w-full" onClick={() => {
                    setEditingPlan(plan);
                    setShowEditDialog(true);
                  }}>
                    <Edit2 className="mr-2 h-4 w-4" /> Edit
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tenants" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Current Plan</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">{tenant.name}</TableCell>
                      <TableCell>
                        <Badge variant={tenant.status === "active" ? "default" : "outline"}>
                          {tenant.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select 
                          defaultValue={tenant.planId} 
                          onValueChange={(val) => handleUpdateTenantPlan(tenant.id, val)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {plans.map(p => (
                              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{tenant.employeeCount}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => {
                          setSelectedTenant(tenant);
                          setShowLimitsDialog(true);
                        }}>
                          Set Limits
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${revenueStats.mrr.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Annual Recurring Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${revenueStats.arr.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{revenueStats.activeSubscribers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Revenue Per Tenant</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${revenueStats.arpt.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Plan Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>MRR by Plan Type</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mrrByPlanData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="mrr" fill="#2563EB" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Plan Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlan?.id ? "Edit Plan" : "Create New Plan"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSavePlan} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  value={editingPlan?.name} 
                  onChange={e => setEditingPlan(prev => ({ 
                    ...prev, 
                    name: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/\s+/g, '-')
                  }))} 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" value={editingPlan?.slug} readOnly />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={editingPlan?.description} 
                onChange={e => setEditingPlan(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priceMonthly">Monthly Price</Label>
                <Input 
                  id="priceMonthly" 
                  type="number" 
                  value={editingPlan?.priceMonthly} 
                  onChange={e => setEditingPlan(prev => ({ ...prev, priceMonthly: parseFloat(e.target.value) }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceYearly">Yearly Price</Label>
                <Input 
                  id="priceYearly" 
                  type="number" 
                  value={editingPlan?.priceYearly} 
                  onChange={e => setEditingPlan(prev => ({ ...prev, priceYearly: parseFloat(e.target.value) }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select 
                  value={editingPlan?.currency} 
                  onValueChange={val => setEditingPlan(prev => ({ ...prev, currency: val }))}
                >
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="SAR">SAR</SelectItem>
                    <SelectItem value="AED">AED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxEmployees">Max Employees</Label>
                <Input 
                  id="maxEmployees" 
                  type="number" 
                  value={editingPlan?.maxEmployees} 
                  onChange={e => setEditingPlan(prev => ({ ...prev, maxEmployees: parseInt(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxHrUsers">Max HR Users</Label>
                <Input 
                  id="maxHrUsers" 
                  type="number" 
                  value={editingPlan?.maxHrUsers} 
                  onChange={e => setEditingPlan(prev => ({ ...prev, maxHrUsers: parseInt(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxAdminUsers">Max Admin Users</Label>
                <Input 
                  id="maxAdminUsers" 
                  type="number" 
                  value={editingPlan?.maxAdminUsers} 
                  onChange={e => setEditingPlan(prev => ({ ...prev, maxAdminUsers: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div className="flex gap-6 items-center py-2">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="isPopular" 
                  checked={editingPlan?.isPopular} 
                  onCheckedChange={val => setEditingPlan(prev => ({ ...prev, isPopular: val }))}
                />
                <Label htmlFor="isPopular">Most Popular</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="active" 
                  checked={editingPlan?.active} 
                  onCheckedChange={val => setEditingPlan(prev => ({ ...prev, active: val }))}
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Modules</Label>
              <div className="grid grid-cols-3 gap-2 border rounded-md p-3">
                {AVAILABLE_MODULES.map(module => (
                  <div key={module} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`mod-${module}`} 
                      checked={editingPlan?.modules?.includes(module)}
                      onCheckedChange={(checked) => {
                        const current = editingPlan?.modules || [];
                        setEditingPlan(prev => ({
                          ...prev,
                          modules: checked 
                            ? [...current, module]
                            : current.filter(m => m !== module)
                        }));
                      }}
                    />
                    <label htmlFor={`mod-${module}`} className="text-xs capitalize cursor-pointer">{module.replace('-', ' ')}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Features (comma separated)</Label>
              <Textarea 
                id="features" 
                placeholder="Feature 1, Feature 2, Feature 3"
                value={editingPlan?.features?.join(", ")} 
                onChange={e => setEditingPlan(prev => ({ 
                  ...prev, 
                  features: e.target.value.split(",").map(f => f.trim()).filter(f => f !== "") 
                }))}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
              <Button type="submit">Save Plan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Limits Dialog */}
      <Dialog open={showLimitsDialog} onOpenChange={setShowLimitsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Custom Limits: {selectedTenant?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateLimits} className="space-y-4">
            <div className="space-y-2">
              <Label>Max Employees</Label>
              <Input 
                type="number" 
                value={selectedTenant?.maxEmployees || 0} 
                onChange={e => setSelectedTenant(prev => prev ? ({ ...prev, maxEmployees: parseInt(e.target.value) }) : null)}
              />
            </div>
            <div className="space-y-2">
              <Label>Max HR Users</Label>
              <Input 
                type="number" 
                value={selectedTenant?.maxHrUsers || 0} 
                onChange={e => setSelectedTenant(prev => prev ? ({ ...prev, maxHrUsers: parseInt(e.target.value) }) : null)}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Admin Users</Label>
              <Input 
                type="number" 
                value={selectedTenant?.maxAdminUsers || 0} 
                onChange={e => setSelectedTenant(prev => prev ? ({ ...prev, maxAdminUsers: parseInt(e.target.value) }) : null)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowLimitsDialog(false)}>Cancel</Button>
              <Button type="submit">Update Limits</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
