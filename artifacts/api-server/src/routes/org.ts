import { Router } from "express";
import { db, departmentsTable, branchesTable, jobLevelsTable, employeesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();

// ── DEPARTMENTS ──────────────────────────────────────────────────────────────
router.get("/departments", requireAuth, async (req: AuthRequest, res) => {
  const depts = await db.select().from(departmentsTable).where(eq(departmentsTable.tenantId, req.tenantId!));
  const emps = await db.select({ id: employeesTable.id, departmentId: employeesTable.departmentId }).from(employeesTable).where(eq(employeesTable.tenantId, req.tenantId!));
  const result = depts.map(d => ({ ...d, employeeCount: emps.filter(e => e.departmentId === d.id).length, headName: null }));
  res.json(result);
});

router.post("/departments", requireAuth, async (req: AuthRequest, res) => {
  const [dept] = await db.insert(departmentsTable).values({ ...req.body, tenantId: req.tenantId! }).returning();
  res.status(201).json({ ...dept, employeeCount: 0, headName: null });
});

router.patch("/departments/:id", requireAuth, async (req: AuthRequest, res) => {
  const [dept] = await db.update(departmentsTable).set(req.body).where(and(eq(departmentsTable.id, Number(req.params.id)), eq(departmentsTable.tenantId, req.tenantId!))).returning();
  if (!dept) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...dept, employeeCount: 0, headName: null });
});

router.delete("/departments/:id", requireAuth, async (req: AuthRequest, res) => {
  await db.delete(departmentsTable).where(and(eq(departmentsTable.id, Number(req.params.id)), eq(departmentsTable.tenantId, req.tenantId!)));
  res.status(204).send();
});

// ── BRANCHES ─────────────────────────────────────────────────────────────────
router.get("/branches", requireAuth, async (req: AuthRequest, res) => {
  const branches = await db.select().from(branchesTable).where(eq(branchesTable.tenantId, req.tenantId!));
  const emps = await db.select({ id: employeesTable.id, branchId: employeesTable.branchId }).from(employeesTable).where(eq(employeesTable.tenantId, req.tenantId!));
  res.json(branches.map(b => ({ ...b, employeeCount: emps.filter(e => e.branchId === b.id).length })));
});

router.post("/branches", requireAuth, async (req: AuthRequest, res) => {
  const [branch] = await db.insert(branchesTable).values({ ...req.body, tenantId: req.tenantId! }).returning();
  res.status(201).json({ ...branch, employeeCount: 0 });
});

router.patch("/branches/:id", requireAuth, async (req: AuthRequest, res) => {
  const [branch] = await db.update(branchesTable).set(req.body).where(and(eq(branchesTable.id, Number(req.params.id)), eq(branchesTable.tenantId, req.tenantId!))).returning();
  if (!branch) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...branch, employeeCount: 0 });
});

router.delete("/branches/:id", requireAuth, async (req: AuthRequest, res) => {
  await db.delete(branchesTable).where(and(eq(branchesTable.id, Number(req.params.id)), eq(branchesTable.tenantId, req.tenantId!)));
  res.status(204).send();
});

// ── JOB LEVELS ────────────────────────────────────────────────────────────────
router.get("/job-levels", requireAuth, async (req: AuthRequest, res) => {
  const levels = await db.select().from(jobLevelsTable).where(eq(jobLevelsTable.tenantId, req.tenantId!));
  res.json(levels);
});

router.post("/job-levels", requireAuth, async (req: AuthRequest, res) => {
  const [level] = await db.insert(jobLevelsTable).values({ ...req.body, tenantId: req.tenantId! }).returning();
  res.status(201).json(level);
});

export default router;
