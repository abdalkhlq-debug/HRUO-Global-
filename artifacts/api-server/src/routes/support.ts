import { Router } from "express";
import { db, supportTicketsTable, supportMessagesTable, tenantsTable, usersTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth, requireSuperAdmin, type AuthRequest } from "../middlewares/auth";

const router = Router();

const formatTicket = (t: typeof supportTicketsTable.$inferSelect) => ({
  ...t,
  createdAt: t.createdAt.toISOString(),
  updatedAt: t.updatedAt.toISOString(),
  resolvedAt: t.resolvedAt?.toISOString() ?? null,
});

// ── Tenant: Create ticket ─────────────────────────────────────────────────────
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const [ticket] = await db.insert(supportTicketsTable).values({
    tenantId: req.tenantId!,
    subject: req.body.subject,
    description: req.body.description,
    priority: req.body.priority ?? "medium",
    category: req.body.category ?? "general",
  }).returning();

  // Auto-add first message from description
  await db.insert(supportMessagesTable).values({
    ticketId: ticket.id,
    message: ticket.description,
    fromAdmin: false,
    authorName: req.user?.name ?? "User",
    authorEmail: req.user?.email,
  });

  res.status(201).json(formatTicket(ticket));
});

// ── Tenant: List own tickets ───────────────────────────────────────────────────
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const tickets = await db.select().from(supportTicketsTable)
    .where(eq(supportTicketsTable.tenantId, req.tenantId!))
    .orderBy(desc(supportTicketsTable.createdAt));
  res.json(tickets.map(formatTicket));
});

// ── Tenant: Get ticket + messages ──────────────────────────────────────────────
router.get("/:id", requireAuth, async (req: AuthRequest, res) => {
  const [ticket] = await db.select().from(supportTicketsTable)
    .where(and(eq(supportTicketsTable.id, Number(req.params.id)), eq(supportTicketsTable.tenantId, req.tenantId!)))
    .limit(1);
  if (!ticket) { res.status(404).json({ error: "Not found" }); return; }
  const messages = await db.select().from(supportMessagesTable)
    .where(eq(supportMessagesTable.ticketId, ticket.id))
    .orderBy(supportMessagesTable.createdAt);
  res.json({ ...formatTicket(ticket), messages: messages.map(m => ({ ...m, createdAt: m.createdAt.toISOString() })) });
});

// ── Tenant: Reply to ticket ────────────────────────────────────────────────────
router.post("/:id/messages", requireAuth, async (req: AuthRequest, res) => {
  const [ticket] = await db.select().from(supportTicketsTable)
    .where(and(eq(supportTicketsTable.id, Number(req.params.id)), eq(supportTicketsTable.tenantId, req.tenantId!)))
    .limit(1);
  if (!ticket) { res.status(404).json({ error: "Not found" }); return; }

  const [msg] = await db.insert(supportMessagesTable).values({
    ticketId: ticket.id,
    message: req.body.message,
    fromAdmin: false,
    authorName: req.user?.name ?? "User",
    authorEmail: req.user?.email,
  }).returning();

  // Re-open if was resolved
  if (ticket.status === "resolved") {
    await db.update(supportTicketsTable).set({ status: "open", updatedAt: new Date() }).where(eq(supportTicketsTable.id, ticket.id));
  }
  res.status(201).json({ ...msg, createdAt: msg.createdAt.toISOString() });
});

// ── Super Admin: All tickets ───────────────────────────────────────────────────
router.get("/admin/all", requireSuperAdmin, async (_req, res) => {
  const tickets = await db.select().from(supportTicketsTable).orderBy(desc(supportTicketsTable.createdAt));
  const tenants = await db.select({ id: tenantsTable.id, name: tenantsTable.name, slug: tenantsTable.slug }).from(tenantsTable);
  res.json(tickets.map(t => {
    const tenant = tenants.find(tn => tn.id === t.tenantId);
    return { ...formatTicket(t), tenantName: tenant?.name ?? "Unknown", tenantSlug: tenant?.slug ?? null };
  }));
});

// ── Super Admin: Get ticket + messages ─────────────────────────────────────────
router.get("/admin/:id", requireSuperAdmin, async (req: AuthRequest, res) => {
  const [ticket] = await db.select().from(supportTicketsTable)
    .where(eq(supportTicketsTable.id, Number(req.params.id))).limit(1);
  if (!ticket) { res.status(404).json({ error: "Not found" }); return; }
  const messages = await db.select().from(supportMessagesTable)
    .where(eq(supportMessagesTable.ticketId, ticket.id))
    .orderBy(supportMessagesTable.createdAt);
  const tenants = await db.select({ id: tenantsTable.id, name: tenantsTable.name }).from(tenantsTable);
  const tenant = tenants.find(tn => tn.id === ticket.tenantId);
  res.json({ ...formatTicket(ticket), tenantName: tenant?.name ?? "Unknown", messages: messages.map(m => ({ ...m, createdAt: m.createdAt.toISOString() })) });
});

// ── Super Admin: Reply / update status ────────────────────────────────────────
router.post("/admin/:id/messages", requireSuperAdmin, async (req: AuthRequest, res) => {
  const [ticket] = await db.select().from(supportTicketsTable).where(eq(supportTicketsTable.id, Number(req.params.id))).limit(1);
  if (!ticket) { res.status(404).json({ error: "Not found" }); return; }
  const [msg] = await db.insert(supportMessagesTable).values({
    ticketId: ticket.id,
    message: req.body.message,
    fromAdmin: true,
    authorName: "HRUO Support",
    authorEmail: "support@hruo.net",
  }).returning();
  res.status(201).json({ ...msg, createdAt: msg.createdAt.toISOString() });
});

router.patch("/admin/:id/status", requireSuperAdmin, async (req: AuthRequest, res) => {
  const { status, assignedTo } = req.body;
  const update: Record<string, unknown> = { status, updatedAt: new Date() };
  if (assignedTo !== undefined) update.assignedTo = assignedTo;
  if (status === "resolved") update.resolvedAt = new Date();
  const [ticket] = await db.update(supportTicketsTable).set(update).where(eq(supportTicketsTable.id, Number(req.params.id))).returning();
  if (!ticket) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatTicket(ticket));
});

export default router;
