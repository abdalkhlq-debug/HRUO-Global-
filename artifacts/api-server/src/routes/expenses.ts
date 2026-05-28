import { Router } from "express";
import { db, expenseCategoriesTable, expenseClaimsTable, employeesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/categories", requireAuth, async (req: AuthRequest, res) => {
  const cats = await db.select().from(expenseCategoriesTable).where(eq(expenseCategoriesTable.tenantId, req.tenantId!));
  res.json(cats.map(c => ({ ...c, maxPerClaim: c.maxPerClaim ? Number(c.maxPerClaim) : null, yearlyLimit: c.yearlyLimit ? Number(c.yearlyLimit) : null })));
});

router.post("/categories", requireAuth, async (req: AuthRequest, res) => {
  const [cat] = await db.insert(expenseCategoriesTable).values({ ...req.body, tenantId: req.tenantId! }).returning();
  res.status(201).json({ ...cat, maxPerClaim: cat.maxPerClaim ? Number(cat.maxPerClaim) : null, yearlyLimit: cat.yearlyLimit ? Number(cat.yearlyLimit) : null });
});

router.get("/claims", requireAuth, async (req: AuthRequest, res) => {
  const { employeeId, status } = req.query;
  let conditions: any[] = [eq(expenseClaimsTable.tenantId, req.tenantId!)];
  if (employeeId) conditions.push(eq(expenseClaimsTable.employeeId, Number(employeeId)));
  if (status) conditions.push(eq(expenseClaimsTable.status, String(status)));

  const claims = await db.select().from(expenseClaimsTable).where(and(...conditions)).orderBy(expenseClaimsTable.submittedAt);
  const emps = await db.select({ id: employeesTable.id, firstName: employeesTable.firstName, lastName: employeesTable.lastName }).from(employeesTable).where(eq(employeesTable.tenantId, req.tenantId!));
  const cats = await db.select().from(expenseCategoriesTable).where(eq(expenseCategoriesTable.tenantId, req.tenantId!));

  res.json(claims.map(c => {
    const emp = emps.find(e => e.id === c.employeeId);
    const cat = cats.find(ct => ct.id === c.categoryId);
    return { ...c, amount: Number(c.amount), employeeName: emp ? `${emp.firstName} ${emp.lastName}` : null, categoryName: cat?.name ?? null, submittedAt: c.submittedAt.toISOString() };
  }));
});

router.post("/claims", requireAuth, async (req: AuthRequest, res) => {
  const [claim] = await db.insert(expenseClaimsTable).values({ ...req.body, tenantId: req.tenantId! }).returning();
  res.status(201).json({ ...claim, amount: Number(claim.amount), submittedAt: claim.submittedAt.toISOString() });
});

router.post("/claims/:id/approve", requireAuth, async (req: AuthRequest, res) => {
  const { action, remark } = req.body;
  const status = action === "approve" ? "approved" : "rejected";
  const [claim] = await db.update(expenseClaimsTable).set({ status, approverRemark: remark, approvedBy: req.userId }).where(and(eq(expenseClaimsTable.id, Number(req.params.id)), eq(expenseClaimsTable.tenantId, req.tenantId!))).returning();
  if (!claim) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...claim, amount: Number(claim.amount), submittedAt: claim.submittedAt.toISOString() });
});

export default router;
