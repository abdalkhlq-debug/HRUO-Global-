import { Router } from "express";
import { db, coursesTable, trainingRecordsTable, employeesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/courses", requireAuth, async (req: AuthRequest, res) => {
  const courses = await db.select().from(coursesTable).where(eq(coursesTable.tenantId, req.tenantId!));
  res.json(courses);
});

router.post("/courses", requireAuth, async (req: AuthRequest, res) => {
  const [course] = await db.insert(coursesTable).values({ ...req.body, tenantId: req.tenantId! }).returning();
  res.status(201).json(course);
});

router.get("/records", requireAuth, async (req: AuthRequest, res) => {
  const { employeeId } = req.query;
  let conditions: any[] = [eq(trainingRecordsTable.tenantId, req.tenantId!)];
  if (employeeId) conditions.push(eq(trainingRecordsTable.employeeId, Number(employeeId)));
  const records = await db.select().from(trainingRecordsTable).where(and(...conditions));
  const emps = await db.select({ id: employeesTable.id, firstName: employeesTable.firstName, lastName: employeesTable.lastName }).from(employeesTable).where(eq(employeesTable.tenantId, req.tenantId!));
  const courses = await db.select().from(coursesTable).where(eq(coursesTable.tenantId, req.tenantId!));
  res.json(records.map(r => {
    const emp = emps.find(e => e.id === r.employeeId);
    const course = courses.find(c => c.id === r.courseId);
    return { ...r, rating: r.rating ? Number(r.rating) : null, employeeName: emp ? `${emp.firstName} ${emp.lastName}` : null, courseName: course?.name ?? null };
  }));
});

router.post("/records", requireAuth, async (req: AuthRequest, res) => {
  const [record] = await db.insert(trainingRecordsTable).values({ ...req.body, tenantId: req.tenantId! }).returning();
  res.status(201).json({ ...record, rating: null });
});

export default router;
