import { Router } from "express";
import { db, attendanceRecordsTable, employeesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/records", requireAuth, async (req: AuthRequest, res) => {
  const { employeeId, date } = req.query;
  let conditions: any[] = [eq(attendanceRecordsTable.tenantId, req.tenantId!)];
  if (employeeId) conditions.push(eq(attendanceRecordsTable.employeeId, Number(employeeId)));
  if (date) conditions.push(eq(attendanceRecordsTable.date, String(date)));

  const records = await db.select().from(attendanceRecordsTable).where(and(...conditions)).orderBy(attendanceRecordsTable.date);
  const emps = await db.select({ id: employeesTable.id, firstName: employeesTable.firstName, lastName: employeesTable.lastName }).from(employeesTable).where(eq(employeesTable.tenantId, req.tenantId!));

  res.json(records.map(r => {
    const emp = emps.find(e => e.id === r.employeeId);
    return {
      ...r,
      totalHours: r.totalHours ? Number(r.totalHours) : null,
      overtime: r.overtime ? Number(r.overtime) : null,
      latitude: r.latitude ? Number(r.latitude) : null,
      longitude: r.longitude ? Number(r.longitude) : null,
      employeeName: emp ? `${emp.firstName} ${emp.lastName}` : null,
    };
  }));
});

router.post("/records", requireAuth, async (req: AuthRequest, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const clockIn = new Date().toTimeString().slice(0, 5);
  const [record] = await db.insert(attendanceRecordsTable).values({
    ...req.body,
    tenantId: req.tenantId!,
    date: today,
    clockIn,
    status: "present",
  }).returning();
  res.status(201).json({ ...record, totalHours: null, overtime: null });
});

router.post("/records/:id/clock-out", requireAuth, async (req: AuthRequest, res) => {
  const clockOut = new Date().toTimeString().slice(0, 5);
  const [record] = await db.select().from(attendanceRecordsTable).where(eq(attendanceRecordsTable.id, Number(req.params.id))).limit(1);
  let totalHours: number | null = null;
  if (record?.clockIn && clockOut) {
    const [h1, m1] = record.clockIn.split(":").map(Number);
    const [h2, m2] = clockOut.split(":").map(Number);
    totalHours = Math.round(((h2 * 60 + m2) - (h1 * 60 + m1)) / 60 * 100) / 100;
  }
  const [updated] = await db.update(attendanceRecordsTable).set({ clockOut, totalHours: String(totalHours) }).where(eq(attendanceRecordsTable.id, Number(req.params.id))).returning();
  res.json({ ...updated, totalHours, overtime: null });
});

router.get("/summary", requireAuth, async (req: AuthRequest, res) => {
  const { month } = req.query;
  const targetMonth = String(month ?? new Date().toISOString().slice(0, 7));
  const records = await db.select().from(attendanceRecordsTable).where(eq(attendanceRecordsTable.tenantId, req.tenantId!));
  const monthRecords = records.filter(r => r.date.startsWith(targetMonth));
  res.json({
    month: targetMonth,
    totalPresent: monthRecords.filter(r => r.status === "present").length,
    totalAbsent: monthRecords.filter(r => r.status === "absent").length,
    totalLate: monthRecords.filter(r => r.status === "late").length,
    totalOvertime: monthRecords.reduce((s, r) => s + (r.overtime ? Number(r.overtime) : 0), 0),
    byEmployee: [],
  });
});

export default router;
