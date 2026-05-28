import { Router } from "express";
import { db, employeesTable, departmentsTable, branchesTable } from "@workspace/db";
import { eq, and, ilike, or, sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();

// GET /api/employees
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const { search, departmentId, branchId, status } = req.query;
  const tenantId = req.tenantId!;

  let conditions: any[] = [eq(employeesTable.tenantId, tenantId)];
  if (status) conditions.push(eq(employeesTable.status, String(status)));
  if (departmentId) conditions.push(eq(employeesTable.departmentId, Number(departmentId)));
  if (branchId) conditions.push(eq(employeesTable.branchId, Number(branchId)));
  if (search) {
    const s = `%${search}%`;
    conditions.push(or(ilike(employeesTable.firstName, s), ilike(employeesTable.lastName, s), ilike(employeesTable.email, s), ilike(employeesTable.employeeNumber, s)));
  }

  const emps = await db.select().from(employeesTable).where(and(...conditions)).orderBy(employeesTable.createdAt);
  res.json(emps.map(e => ({ ...e, basicSalary: e.basicSalary ? Number(e.basicSalary) : null })));
});

// POST /api/employees
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const tenantId = req.tenantId!;
  const count = await db.$count(employeesTable, eq(employeesTable.tenantId, tenantId));
  const employeeNumber = `EMP-${String(count + 1).padStart(4, "0")}`;
  const [emp] = await db.insert(employeesTable).values({ ...req.body, tenantId, employeeNumber }).returning();
  res.status(201).json({ ...emp, basicSalary: emp.basicSalary ? Number(emp.basicSalary) : null });
});

// GET /api/employees/stats
router.get("/stats", requireAuth, async (req: AuthRequest, res) => {
  const tenantId = req.tenantId!;
  const all = await db.select().from(employeesTable).where(eq(employeesTable.tenantId, tenantId));
  const depts = await db.select().from(departmentsTable).where(eq(departmentsTable.tenantId, tenantId));
  const deptCount = depts.map(d => ({
    name: d.name,
    count: all.filter(e => e.departmentId === d.id).length,
  }));
  const now = new Date();
  const thisMonth = all.filter(e => {
    if (!e.dateJoined) return false;
    const d = new Date(e.dateJoined);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  res.json({
    total: all.length,
    active: all.filter(e => e.status === "active").length,
    onLeave: all.filter(e => e.status === "on_leave").length,
    terminated: all.filter(e => e.status === "terminated").length,
    newThisMonth: thisMonth,
    departments: deptCount,
  });
});

// GET /api/employees/:id
router.get("/:id", requireAuth, async (req: AuthRequest, res) => {
  const [emp] = await db.select().from(employeesTable).where(and(eq(employeesTable.id, Number(req.params.id)), eq(employeesTable.tenantId, req.tenantId!))).limit(1);
  if (!emp) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...emp, basicSalary: emp.basicSalary ? Number(emp.basicSalary) : null });
});

// PATCH /api/employees/:id
router.patch("/:id", requireAuth, async (req: AuthRequest, res) => {
  const [emp] = await db.update(employeesTable).set(req.body).where(and(eq(employeesTable.id, Number(req.params.id)), eq(employeesTable.tenantId, req.tenantId!))).returning();
  if (!emp) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...emp, basicSalary: emp.basicSalary ? Number(emp.basicSalary) : null });
});

// DELETE /api/employees/:id
router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  await db.delete(employeesTable).where(and(eq(employeesTable.id, Number(req.params.id)), eq(employeesTable.tenantId, req.tenantId!)));
  res.status(204).send();
});

export default router;
