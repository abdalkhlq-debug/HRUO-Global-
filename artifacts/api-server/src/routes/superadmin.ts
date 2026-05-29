import { Router } from "express";
import { db, tenantsTable, quoteRequestsTable, auditLogsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireSuperAdmin, type AuthRequest } from "../middlewares/auth";
import { employeesTable } from "@workspace/db";

const router = Router();

// Tenants
router.get("/tenants", requireSuperAdmin, async (req: AuthRequest, res) => {
  const tenants = await db.select().from(tenantsTable).orderBy(desc(tenantsTable.createdAt));
  res.json(tenants.map(t => ({
    ...t,
    modules: Array.isArray(t.modules) ? t.modules : [],
    subscriptionStart: t.subscriptionStart?.toISOString() ?? null,
    subscriptionEnd: t.subscriptionEnd?.toISOString() ?? null,
    createdAt: t.createdAt.toISOString(),
  })));
});

router.post("/tenants", requireSuperAdmin, async (req: AuthRequest, res) => {
  const [tenant] = await db.insert(tenantsTable).values(req.body).returning();
  res.status(201).json({ ...tenant, modules: Array.isArray(tenant.modules) ? tenant.modules : [], createdAt: tenant.createdAt.toISOString() });
});

router.patch("/tenants/:id", requireSuperAdmin, async (req: AuthRequest, res) => {
  const [tenant] = await db.update(tenantsTable).set(req.body).where(eq(tenantsTable.id, Number(req.params.id))).returning();
  if (!tenant) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...tenant, modules: Array.isArray(tenant.modules) ? tenant.modules : [], createdAt: tenant.createdAt.toISOString() });
});

// Audit logs
router.get("/audit-logs", requireSuperAdmin, async (req: AuthRequest, res) => {
  const logs = await db.select().from(auditLogsTable).orderBy(desc(auditLogsTable.timestamp)).limit(500);
  res.json(logs.map(l => ({ ...l, timestamp: l.timestamp.toISOString() })));
});

// Super admin analytics
router.get("/analytics", requireSuperAdmin, async (req: AuthRequest, res) => {
  const tenants = await db.select().from(tenantsTable);
  const quotes = await db.select().from(quoteRequestsTable);
  const employees = await db.select().from(employeesTable);

  res.json({
    totalTenants: tenants.length,
    activeTenants: tenants.filter(t => t.status === "active").length,
    pendingApprovals: quotes.filter(q => q.status === "new").length,
    totalRevenue: 0,
    revenueByMonth: [],
    tenantsByStatus: [
      { status: "active",    count: tenants.filter(t => t.status === "active").length },
      { status: "trial",     count: tenants.filter(t => t.status === "trial").length },
      { status: "pending",   count: tenants.filter(t => t.status === "pending").length },
      { status: "suspended", count: tenants.filter(t => t.status === "suspended").length },
    ],
    totalEmployees: employees.length,
    recentActivity: [],
  });
});

// Quote requests (also for super admin)
router.get("/quotes", requireSuperAdmin, async (req: AuthRequest, res) => {
  const quotes = await db.select().from(quoteRequestsTable).orderBy(desc(quoteRequestsTable.createdAt));
  res.json(quotes.map(q => ({
    ...q,
    modules: Array.isArray(q.modules) ? q.modules : [],
    createdAt: q.createdAt.toISOString(),
  })));
});

router.patch("/quotes/:id", requireSuperAdmin, async (req: AuthRequest, res) => {
  const [quote] = await db.update(quoteRequestsTable).set(req.body).where(eq(quoteRequestsTable.id, Number(req.params.id))).returning();
  if (!quote) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...quote, modules: Array.isArray(quote.modules) ? quote.modules : [], createdAt: quote.createdAt.toISOString() });
});

export default router;
