import { Router } from "express";
import { db, announcementsTable, discussionsTable, documentsTable, tasksTable, incidentsTable, employeesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();

// Announcements
router.get("/announcements", requireAuth, async (req: AuthRequest, res) => {
  const items = await db.select().from(announcementsTable).where(eq(announcementsTable.tenantId, req.tenantId!)).orderBy(announcementsTable.createdAt);
  res.json(items.map(a => ({ ...a, authorName: null, createdAt: a.createdAt.toISOString() })));
});

router.post("/announcements", requireAuth, async (req: AuthRequest, res) => {
  const [item] = await db.insert(announcementsTable).values({ ...req.body, tenantId: req.tenantId!, authorId: req.userId }).returning();
  res.status(201).json({ ...item, authorName: null, createdAt: item.createdAt.toISOString() });
});

router.patch("/announcements/:id", requireAuth, async (req: AuthRequest, res) => {
  const [item] = await db.update(announcementsTable).set(req.body).where(and(eq(announcementsTable.id, Number(req.params.id)), eq(announcementsTable.tenantId, req.tenantId!))).returning();
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...item, authorName: null, createdAt: item.createdAt.toISOString() });
});

// Discussions
router.get("/discussions", requireAuth, async (req: AuthRequest, res) => {
  const items = await db.select().from(discussionsTable).where(eq(discussionsTable.tenantId, req.tenantId!)).orderBy(discussionsTable.createdAt);
  res.json(items.map(d => ({ ...d, authorName: null, createdAt: d.createdAt.toISOString() })));
});

router.post("/discussions", requireAuth, async (req: AuthRequest, res) => {
  const [item] = await db.insert(discussionsTable).values({ ...req.body, tenantId: req.tenantId!, authorId: req.userId! }).returning();
  res.status(201).json({ ...item, authorName: null, createdAt: item.createdAt.toISOString() });
});

// Documents
router.get("/documents", requireAuth, async (req: AuthRequest, res) => {
  const docs = await db.select().from(documentsTable).where(eq(documentsTable.tenantId, req.tenantId!));
  res.json(docs.map(d => ({ ...d, uploadedBy: null, createdAt: d.createdAt.toISOString() })));
});

router.post("/documents", requireAuth, async (req: AuthRequest, res) => {
  const [doc] = await db.insert(documentsTable).values({ ...req.body, tenantId: req.tenantId!, uploadedBy: req.userId }).returning();
  res.status(201).json({ ...doc, uploadedBy: null, createdAt: doc.createdAt.toISOString() });
});

// Tasks
router.get("/tasks", requireAuth, async (req: AuthRequest, res) => {
  const { assigneeId, status } = req.query;
  let conditions: any[] = [eq(tasksTable.tenantId, req.tenantId!)];
  if (assigneeId) conditions.push(eq(tasksTable.assigneeId, Number(assigneeId)));
  if (status) conditions.push(eq(tasksTable.status, String(status)));
  const items = await db.select().from(tasksTable).where(and(...conditions)).orderBy(tasksTable.createdAt);
  const emps = await db.select({ id: employeesTable.id, firstName: employeesTable.firstName, lastName: employeesTable.lastName }).from(employeesTable).where(eq(employeesTable.tenantId, req.tenantId!));
  res.json(items.map(t => {
    const emp = emps.find(e => e.id === t.assigneeId);
    return { ...t, assigneeName: emp ? `${emp.firstName} ${emp.lastName}` : null, createdAt: t.createdAt.toISOString() };
  }));
});

router.post("/tasks", requireAuth, async (req: AuthRequest, res) => {
  const [task] = await db.insert(tasksTable).values({ ...req.body, tenantId: req.tenantId!, createdBy: req.userId }).returning();
  res.status(201).json({ ...task, assigneeName: null, createdAt: task.createdAt.toISOString() });
});

router.patch("/tasks/:id", requireAuth, async (req: AuthRequest, res) => {
  const [task] = await db.update(tasksTable).set(req.body).where(and(eq(tasksTable.id, Number(req.params.id)), eq(tasksTable.tenantId, req.tenantId!))).returning();
  if (!task) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...task, assigneeName: null, createdAt: task.createdAt.toISOString() });
});

router.delete("/tasks/:id", requireAuth, async (req: AuthRequest, res) => {
  await db.delete(tasksTable).where(and(eq(tasksTable.id, Number(req.params.id)), eq(tasksTable.tenantId, req.tenantId!)));
  res.status(204).send();
});

// Incidents
router.get("/incidents", requireAuth, async (req: AuthRequest, res) => {
  const items = await db.select().from(incidentsTable).where(eq(incidentsTable.tenantId, req.tenantId!));
  const emps = await db.select({ id: employeesTable.id, firstName: employeesTable.firstName, lastName: employeesTable.lastName }).from(employeesTable).where(eq(employeesTable.tenantId, req.tenantId!));
  res.json(items.map(i => {
    const emp = emps.find(e => e.id === i.employeeId);
    return { ...i, penalty: i.penalty ? Number(i.penalty) : null, employeeName: emp ? `${emp.firstName} ${emp.lastName}` : null, createdAt: i.createdAt.toISOString() };
  }));
});

router.post("/incidents", requireAuth, async (req: AuthRequest, res) => {
  const [item] = await db.insert(incidentsTable).values({ ...req.body, tenantId: req.tenantId! }).returning();
  res.status(201).json({ ...item, penalty: item.penalty ? Number(item.penalty) : null, createdAt: item.createdAt.toISOString() });
});

router.patch("/incidents/:id", requireAuth, async (req: AuthRequest, res) => {
  const [item] = await db.update(incidentsTable).set(req.body).where(and(eq(incidentsTable.id, Number(req.params.id)), eq(incidentsTable.tenantId, req.tenantId!))).returning();
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...item, penalty: item.penalty ? Number(item.penalty) : null, createdAt: item.createdAt.toISOString() });
});

export default router;
