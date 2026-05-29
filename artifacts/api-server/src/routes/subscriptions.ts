import { Router } from "express";
import { db, subscriptionPlansTable, tenantsTable, usersTable, employeesTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireSuperAdmin, requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();

// ── Plans ──────────────────────────────────────────────────────────────────────
router.get("/plans", async (_req, res) => {
  const plans = await db.select().from(subscriptionPlansTable)
    .where(eq(subscriptionPlansTable.active, true))
    .orderBy(subscriptionPlansTable.sortOrder);
  res.json(plans.map(p => ({
    ...p,
    priceMonthly: Number(p.priceMonthly),
    priceYearly: Number(p.priceYearly),
    modules: Array.isArray(p.modules) ? p.modules : [],
    features: Array.isArray(p.features) ? p.features : [],
    createdAt: p.createdAt.toISOString(),
  })));
});

router.get("/plans/all", requireSuperAdmin, async (_req, res) => {
  const plans = await db.select().from(subscriptionPlansTable).orderBy(subscriptionPlansTable.sortOrder);
  res.json(plans.map(p => ({
    ...p,
    priceMonthly: Number(p.priceMonthly),
    priceYearly: Number(p.priceYearly),
    modules: Array.isArray(p.modules) ? p.modules : [],
    features: Array.isArray(p.features) ? p.features : [],
    createdAt: p.createdAt.toISOString(),
  })));
});

router.post("/plans", requireSuperAdmin, async (req: AuthRequest, res) => {
  const [plan] = await db.insert(subscriptionPlansTable).values(req.body).returning();
  res.status(201).json({ ...plan, priceMonthly: Number(plan.priceMonthly), priceYearly: Number(plan.priceYearly), modules: Array.isArray(plan.modules) ? plan.modules : [], features: Array.isArray(plan.features) ? plan.features : [] });
});

router.patch("/plans/:id", requireSuperAdmin, async (req: AuthRequest, res) => {
  const [plan] = await db.update(subscriptionPlansTable).set({ ...req.body, updatedAt: new Date() }).where(eq(subscriptionPlansTable.id, Number(req.params.id))).returning();
  if (!plan) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...plan, priceMonthly: Number(plan.priceMonthly), priceYearly: Number(plan.priceYearly), modules: Array.isArray(plan.modules) ? plan.modules : [], features: Array.isArray(plan.features) ? plan.features : [] });
});

router.delete("/plans/:id", requireSuperAdmin, async (req: AuthRequest, res) => {
  await db.delete(subscriptionPlansTable).where(eq(subscriptionPlansTable.id, Number(req.params.id)));
  res.status(204).end();
});

// ── Tenant subscription assignment ─────────────────────────────────────────────
router.patch("/tenants/:id/plan", requireSuperAdmin, async (req: AuthRequest, res) => {
  const { planId } = req.body;
  const plan = planId ? await db.select().from(subscriptionPlansTable).where(eq(subscriptionPlansTable.id, Number(planId))).limit(1).then(r => r[0]) : null;

  const update: Record<string, unknown> = { planId: planId ?? null, updatedAt: new Date() };
  if (plan) {
    update.maxEmployees = plan.maxEmployees;
    update.maxHrUsers = plan.maxHrUsers;
    update.maxAdminUsers = plan.maxAdminUsers;
    update.modules = Array.isArray(plan.modules) ? plan.modules : [];
  }

  const [tenant] = await db.update(tenantsTable).set(update).where(eq(tenantsTable.id, Number(req.params.id))).returning();
  if (!tenant) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...tenant, modules: Array.isArray(tenant.modules) ? tenant.modules : [], createdAt: tenant.createdAt.toISOString() });
});

// ── Tenant limits ──────────────────────────────────────────────────────────────
router.patch("/tenants/:id/limits", requireSuperAdmin, async (req: AuthRequest, res) => {
  const { maxEmployees, maxHrUsers, maxAdminUsers } = req.body;
  const [tenant] = await db.update(tenantsTable)
    .set({ maxEmployees, maxHrUsers, maxAdminUsers, updatedAt: new Date() })
    .where(eq(tenantsTable.id, Number(req.params.id))).returning();
  if (!tenant) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...tenant, modules: Array.isArray(tenant.modules) ? tenant.modules : [], createdAt: tenant.createdAt.toISOString() });
});

// ── Per-tenant users view (for super admin) ─────────────────────────────────────
router.get("/tenants/:id/users", requireSuperAdmin, async (req: AuthRequest, res) => {
  const tenantId = Number(req.params.id);
  const users = await db.select().from(usersTable).where(eq(usersTable.tenantId, tenantId));
  const employees = await db.select({ id: employeesTable.id, firstName: employeesTable.firstName, lastName: employeesTable.lastName, jobTitle: employeesTable.jobTitle })
    .from(employeesTable).where(eq(employeesTable.tenantId, tenantId));
  res.json(users.map(u => {
    const emp = employees.find(e => e.id === u.employeeId);
    return { id: u.id, email: u.email, name: u.name, role: u.role, active: u.active, lastLogin: u.lastLogin?.toISOString() ?? null, createdAt: u.createdAt.toISOString(), employeeName: emp ? `${emp.firstName} ${emp.lastName}` : null, jobTitle: emp?.jobTitle ?? null };
  }));
});

// ── All users across all tenants ────────────────────────────────────────────────
router.get("/users", requireSuperAdmin, async (_req, res) => {
  const users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
  const tenants = await db.select({ id: tenantsTable.id, name: tenantsTable.name }).from(tenantsTable);
  res.json(users.map(u => {
    const tenant = tenants.find(t => t.id === u.tenantId);
    return { id: u.id, email: u.email, name: u.name, role: u.role, active: u.active, isSuperAdmin: u.isSuperAdmin, tenantId: u.tenantId, tenantName: tenant?.name ?? null, lastLogin: u.lastLogin?.toISOString() ?? null, createdAt: u.createdAt.toISOString() };
  }));
});

// ── Toggle user active status ───────────────────────────────────────────────────
router.patch("/users/:id/toggle", requireSuperAdmin, async (req: AuthRequest, res) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, Number(req.params.id))).limit(1);
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  const [updated] = await db.update(usersTable).set({ active: !user.active, updatedAt: new Date() }).where(eq(usersTable.id, user.id)).returning();
  res.json({ id: updated.id, email: updated.email, active: updated.active });
});

export default router;
