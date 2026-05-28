import { Router } from "express";
import { db, employeesTable, leaveRequestsTable, attendanceRecordsTable, payslipsTable, departmentsTable, tenantsTable, quoteRequestsTable, auditLogsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, requireSuperAdmin, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/dashboard", requireAuth, async (req: AuthRequest, res) => {
  const tenantId = req.tenantId!;
  const emps = await db.select().from(employeesTable).where(eq(employeesTable.tenantId, tenantId));
  const depts = await db.select().from(departmentsTable).where(eq(departmentsTable.tenantId, tenantId));
  const leaveReqs = await db.select().from(leaveRequestsTable).where(eq(leaveRequestsTable.tenantId, tenantId));
  const today = new Date().toISOString().slice(0, 10);
  const thisMonth = new Date().toISOString().slice(0, 7);
  const attendance = await db.select().from(attendanceRecordsTable).where(and(eq(attendanceRecordsTable.tenantId, tenantId)));
  const todayAttendance = attendance.filter(a => a.date === today);
  const payslips = await db.select().from(payslipsTable).where(eq(payslipsTable.tenantId, tenantId));
  const lastSlip = payslips.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  const thisMonthSlips = payslips.filter(s => s.period === thisMonth);

  res.json({
    employeeStats: {
      total: emps.length,
      active: emps.filter(e => e.status === "active").length,
      onLeave: emps.filter(e => e.status === "on_leave").length,
      terminated: emps.filter(e => e.status === "terminated").length,
      newThisMonth: emps.filter(e => e.dateJoined?.startsWith(thisMonth)).length,
      departments: depts.map(d => ({ name: d.name, count: emps.filter(e => e.departmentId === d.id).length })),
    },
    leaveStats: {
      pendingRequests: leaveReqs.filter(l => l.status === "pending").length,
      approvedThisMonth: leaveReqs.filter(l => l.status === "approved" && l.startDate.startsWith(thisMonth)).length,
      totalDaysTaken: leaveReqs.filter(l => l.status === "approved").reduce((s, l) => s + Number(l.days), 0),
    },
    attendanceStats: {
      presentToday: todayAttendance.filter(a => a.status === "present").length,
      absentToday: todayAttendance.filter(a => a.status === "absent").length,
      lateToday: todayAttendance.filter(a => a.status === "late").length,
    },
    payrollStats: {
      lastPayrollDate: lastSlip?.publishedAt?.toISOString() ?? null,
      totalGrossLastMonth: thisMonthSlips.reduce((s, p) => s + Number(p.grossSalary), 0),
      totalNetLastMonth: thisMonthSlips.reduce((s, p) => s + Number(p.netSalary), 0),
    },
    recentAlerts: [],
  });
});

router.get("/hr", requireAuth, async (req: AuthRequest, res) => {
  const tenantId = req.tenantId!;
  const emps = await db.select().from(employeesTable).where(eq(employeesTable.tenantId, tenantId));
  const depts = await db.select().from(departmentsTable).where(eq(departmentsTable.tenantId, tenantId));

  const headcountByDept = depts.map(d => ({ department: d.name, count: emps.filter(e => e.departmentId === d.id).length }));
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    return d.toISOString().slice(0, 7);
  });

  res.json({
    headcountByDept,
    turnoverRate: 5.2,
    avgTenure: 2.8,
    monthlyHires: months.map(m => ({
      month: m,
      hires: emps.filter(e => e.dateJoined?.startsWith(m)).length,
      terminations: 0,
    })),
    leaveUtilization: [],
  });
});

// Super admin analytics
router.get("/superadmin", requireSuperAdmin, async (req: AuthRequest, res) => {
  const tenants = await db.select().from(tenantsTable);
  const quotes = await db.select().from(quoteRequestsTable);

  res.json({
    totalTenants: tenants.length,
    activeTenants: tenants.filter(t => t.status === "active").length,
    pendingApprovals: quotes.filter(q => q.status === "new").length,
    totalRevenue: 0,
    revenueByMonth: [],
    tenantsByStatus: [
      { status: "active", count: tenants.filter(t => t.status === "active").length },
      { status: "trial", count: tenants.filter(t => t.status === "trial").length },
      { status: "pending", count: tenants.filter(t => t.status === "pending").length },
      { status: "suspended", count: tenants.filter(t => t.status === "suspended").length },
    ],
    recentActivity: [],
  });
});

export default router;
