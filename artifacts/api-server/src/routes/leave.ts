import { Router } from "express";
import { db, leaveTypesTable, leaveRequestsTable, leaveBalancesTable, employeesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();

// Leave Types
router.get("/types", requireAuth, async (req: AuthRequest, res) => {
  const types = await db.select().from(leaveTypesTable).where(eq(leaveTypesTable.tenantId, req.tenantId!));
  res.json(types.map(t => ({ ...t, daysPerYear: t.daysPerYear ? Number(t.daysPerYear) : null })));
});

router.post("/types", requireAuth, async (req: AuthRequest, res) => {
  const [type] = await db.insert(leaveTypesTable).values({ ...req.body, tenantId: req.tenantId! }).returning();
  res.status(201).json({ ...type, daysPerYear: type.daysPerYear ? Number(type.daysPerYear) : null });
});

// Leave Requests
router.get("/requests", requireAuth, async (req: AuthRequest, res) => {
  const { employeeId, status } = req.query;
  let conditions: any[] = [eq(leaveRequestsTable.tenantId, req.tenantId!)];
  if (employeeId) conditions.push(eq(leaveRequestsTable.employeeId, Number(employeeId)));
  if (status) conditions.push(eq(leaveRequestsTable.status, String(status)));

  const requests = await db.select().from(leaveRequestsTable).where(and(...conditions)).orderBy(leaveRequestsTable.createdAt);
  const emps = await db.select({ id: employeesTable.id, firstName: employeesTable.firstName, lastName: employeesTable.lastName }).from(employeesTable).where(eq(employeesTable.tenantId, req.tenantId!));
  const types = await db.select().from(leaveTypesTable).where(eq(leaveTypesTable.tenantId, req.tenantId!));

  res.json(requests.map(r => {
    const emp = emps.find(e => e.id === r.employeeId);
    const type = types.find(t => t.id === r.leaveTypeId);
    return {
      ...r,
      days: r.days ? Number(r.days) : 0,
      employeeName: emp ? `${emp.firstName} ${emp.lastName}` : null,
      leaveTypeName: type?.name ?? null,
      createdAt: r.createdAt.toISOString(),
    };
  }));
});

router.post("/requests", requireAuth, async (req: AuthRequest, res) => {
  const [request] = await db.insert(leaveRequestsTable).values({ ...req.body, tenantId: req.tenantId! }).returning();
  res.status(201).json({ ...request, days: Number(request.days), createdAt: request.createdAt.toISOString() });
});

router.post("/requests/:id/approve", requireAuth, async (req: AuthRequest, res) => {
  const { action, remark } = req.body;
  const status = action === "approve" ? "approved" : "rejected";
  const [request] = await db.update(leaveRequestsTable).set({ status, approverRemark: remark }).where(and(eq(leaveRequestsTable.id, Number(req.params.id)), eq(leaveRequestsTable.tenantId, req.tenantId!))).returning();
  if (!request) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...request, days: Number(request.days), createdAt: request.createdAt.toISOString() });
});

// Leave Balances
router.get("/balances/:employeeId", requireAuth, async (req: AuthRequest, res) => {
  const balances = await db.select().from(leaveBalancesTable).where(and(eq(leaveBalancesTable.employeeId, Number(req.params.employeeId)), eq(leaveBalancesTable.tenantId, req.tenantId!)));
  const types = await db.select().from(leaveTypesTable).where(eq(leaveTypesTable.tenantId, req.tenantId!));
  res.json(balances.map(b => {
    const type = types.find(t => t.id === b.leaveTypeId);
    const entitled = Number(b.entitled);
    const taken = Number(b.taken);
    return {
      leaveTypeId: b.leaveTypeId,
      leaveTypeName: type?.name ?? "Unknown",
      color: type?.color ?? "#2563EB",
      entitled,
      taken,
      remaining: entitled - taken,
    };
  }));
});

export default router;
