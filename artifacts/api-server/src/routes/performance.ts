import { Router } from "express";
import { db, goalsTable, reviewsTable, employeesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/goals", requireAuth, async (req: AuthRequest, res) => {
  const { employeeId } = req.query;
  let conditions: any[] = [eq(goalsTable.tenantId, req.tenantId!)];
  if (employeeId) conditions.push(eq(goalsTable.employeeId, Number(employeeId)));
  const goals = await db.select().from(goalsTable).where(and(...conditions));
  const emps = await db.select({ id: employeesTable.id, firstName: employeesTable.firstName, lastName: employeesTable.lastName }).from(employeesTable).where(eq(employeesTable.tenantId, req.tenantId!));
  res.json(goals.map(g => {
    const emp = emps.find(e => e.id === g.employeeId);
    return { ...g, progress: Number(g.progress), weight: Number(g.weight), employeeName: emp ? `${emp.firstName} ${emp.lastName}` : null };
  }));
});

router.post("/goals", requireAuth, async (req: AuthRequest, res) => {
  const [goal] = await db.insert(goalsTable).values({ ...req.body, tenantId: req.tenantId! }).returning();
  res.status(201).json({ ...goal, progress: Number(goal.progress), weight: Number(goal.weight) });
});

router.patch("/goals/:id", requireAuth, async (req: AuthRequest, res) => {
  const [goal] = await db.update(goalsTable).set(req.body).where(and(eq(goalsTable.id, Number(req.params.id)), eq(goalsTable.tenantId, req.tenantId!))).returning();
  if (!goal) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...goal, progress: Number(goal.progress), weight: Number(goal.weight) });
});

router.get("/reviews", requireAuth, async (req: AuthRequest, res) => {
  const reviews = await db.select().from(reviewsTable).where(eq(reviewsTable.tenantId, req.tenantId!));
  const emps = await db.select({ id: employeesTable.id, firstName: employeesTable.firstName, lastName: employeesTable.lastName }).from(employeesTable).where(eq(employeesTable.tenantId, req.tenantId!));
  res.json(reviews.map(r => {
    const emp = emps.find(e => e.id === r.employeeId);
    return { ...r, rating: Number(r.rating), employeeName: emp ? `${emp.firstName} ${emp.lastName}` : null, createdAt: r.createdAt.toISOString() };
  }));
});

router.post("/reviews", requireAuth, async (req: AuthRequest, res) => {
  const [review] = await db.insert(reviewsTable).values({ ...req.body, tenantId: req.tenantId!, reviewerId: req.userId }).returning();
  res.status(201).json({ ...review, rating: Number(review.rating), createdAt: review.createdAt.toISOString() });
});

export default router;
