import { Router } from "express";
import { db, payslipsTable, employeesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/payslips", requireAuth, async (req: AuthRequest, res) => {
  const { employeeId, year } = req.query;
  let conditions: any[] = [eq(payslipsTable.tenantId, req.tenantId!)];
  if (employeeId) conditions.push(eq(payslipsTable.employeeId, Number(employeeId)));
  if (year) conditions = conditions.filter(() => true); // would filter by year in period

  const slips = await db.select().from(payslipsTable).where(and(...conditions)).orderBy(payslipsTable.createdAt);
  const emps = await db.select({ id: employeesTable.id, firstName: employeesTable.firstName, lastName: employeesTable.lastName }).from(employeesTable).where(eq(employeesTable.tenantId, req.tenantId!));

  res.json(slips.map(s => {
    const emp = emps.find(e => e.id === s.employeeId);
    return {
      ...s,
      grossSalary: Number(s.grossSalary),
      netSalary: Number(s.netSalary),
      totalDeductions: Number(s.totalDeductions),
      totalEarnings: Number(s.totalEarnings),
      socialInsurance: Number(s.socialInsurance),
      incomeTax: Number(s.incomeTax),
      employeeName: emp ? `${emp.firstName} ${emp.lastName}` : null,
      publishedAt: s.publishedAt?.toISOString() ?? null,
    };
  }));
});

router.post("/payslips", requireAuth, async (req: AuthRequest, res) => {
  const { employeeId, period, isDraft, bonuses = 0, deductions = 0, remarks } = req.body;
  const [emp] = await db.select().from(employeesTable).where(eq(employeesTable.id, Number(employeeId))).limit(1);
  if (!emp) { res.status(404).json({ error: "Employee not found" }); return; }

  const grossSalary = Number(emp.basicSalary ?? 0) + Number(bonuses);
  const socialInsurance = grossSalary * 0.11;
  const taxable = grossSalary - socialInsurance;
  const incomeTax = taxable > 0 ? taxable * 0.15 : 0;
  const totalDeductions = socialInsurance + incomeTax + Number(deductions);
  const netSalary = grossSalary - totalDeductions;

  const [slip] = await db.insert(payslipsTable).values({
    tenantId: req.tenantId!,
    employeeId: Number(employeeId),
    period,
    grossSalary: String(grossSalary),
    netSalary: String(netSalary),
    totalDeductions: String(totalDeductions),
    totalEarnings: String(Number(bonuses)),
    socialInsurance: String(socialInsurance),
    incomeTax: String(incomeTax),
    bonuses: String(bonuses),
    extraDeductions: String(deductions),
    currency: emp.currency ?? "USD",
    status: isDraft ? "draft" : "published",
    remarks,
    publishedAt: isDraft ? null : new Date(),
  }).returning();

  res.status(201).json({
    ...slip,
    grossSalary: Number(slip.grossSalary),
    netSalary: Number(slip.netSalary),
    totalDeductions: Number(slip.totalDeductions),
    totalEarnings: Number(slip.totalEarnings),
    socialInsurance: Number(slip.socialInsurance),
    incomeTax: Number(slip.incomeTax),
    publishedAt: slip.publishedAt?.toISOString() ?? null,
  });
});

router.get("/payslips/:id", requireAuth, async (req: AuthRequest, res) => {
  const [slip] = await db.select().from(payslipsTable).where(and(eq(payslipsTable.id, Number(req.params.id)), eq(payslipsTable.tenantId, req.tenantId!))).limit(1);
  if (!slip) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...slip, grossSalary: Number(slip.grossSalary), netSalary: Number(slip.netSalary), totalDeductions: Number(slip.totalDeductions), totalEarnings: Number(slip.totalEarnings), socialInsurance: Number(slip.socialInsurance), incomeTax: Number(slip.incomeTax), publishedAt: slip.publishedAt?.toISOString() ?? null });
});

// Tax calculator supporting multiple labor laws
router.post("/tax-calculator", async (req, res) => {
  const { grossSalary, country, yearsOfService = 0, terminationType = "resignation" } = req.body;
  const gross = Number(grossSalary);

  const configs: Record<string, { siRate: number; taxBrackets: { min: number; max: number; rate: number }[]; siEmployer: number }> = {
    egypt: { siRate: 0.11, siEmployer: 0.26, taxBrackets: [{ min: 0, max: 15000, rate: 0 }, { min: 15001, max: 30000, rate: 0.1 }, { min: 30001, max: 45000, rate: 0.15 }, { min: 45001, max: 60000, rate: 0.2 }, { min: 60001, max: 200000, rate: 0.225 }, { min: 200001, max: Infinity, rate: 0.25 }] },
    tunisia: { siRate: 0.0918, siEmployer: 0.1683, taxBrackets: [{ min: 0, max: 5000, rate: 0 }, { min: 5001, max: 20000, rate: 0.26 }, { min: 20001, max: 50000, rate: 0.28 }, { min: 50001, max: Infinity, rate: 0.35 }] },
    morocco: { siRate: 0.0448, siEmployer: 0.1848, taxBrackets: [{ min: 0, max: 30000, rate: 0 }, { min: 30001, max: 50000, rate: 0.1 }, { min: 50001, max: 60000, rate: 0.2 }, { min: 60001, max: 80000, rate: 0.3 }, { min: 80001, max: 180000, rate: 0.34 }, { min: 180001, max: Infinity, rate: 0.38 }] },
    gcc: { siRate: 0.05, siEmployer: 0.12, taxBrackets: [{ min: 0, max: Infinity, rate: 0 }] },
    usa: { siRate: 0.0765, siEmployer: 0.0765, taxBrackets: [{ min: 0, max: 11600, rate: 0.1 }, { min: 11601, max: 47150, rate: 0.12 }, { min: 47151, max: 100525, rate: 0.22 }, { min: 100526, max: 191950, rate: 0.24 }, { min: 191951, max: Infinity, rate: 0.32 }] },
    europe: { siRate: 0.14, siEmployer: 0.2, taxBrackets: [{ min: 0, max: 12000, rate: 0 }, { min: 12001, max: 50000, rate: 0.25 }, { min: 50001, max: 100000, rate: 0.35 }, { min: 100001, max: Infinity, rate: 0.45 }] },
  };

  const config = configs[country] ?? configs.egypt;
  const annualGross = gross * 12;
  const annualSI = annualGross * config.siRate;
  const annualTaxable = annualGross - annualSI;

  let annualTax = 0;
  for (const bracket of config.taxBrackets) {
    if (annualTaxable > bracket.min) {
      const taxable = Math.min(annualTaxable, bracket.max) - bracket.min;
      annualTax += taxable * bracket.rate;
    }
  }

  const monthlyTax = annualTax / 12;
  const monthlySI = annualSI / 12;
  const netSalary = gross - monthlyTax - monthlySI;

  // End of service
  const monthlyRate = gross / 30;
  let endOfServiceBonus = 0;
  if (yearsOfService >= 1) {
    if (terminationType === "resignation") {
      endOfServiceBonus = yearsOfService <= 5 ? yearsOfService * monthlyRate * 14 : (5 * monthlyRate * 14) + ((yearsOfService - 5) * monthlyRate * 30);
    } else {
      endOfServiceBonus = yearsOfService * monthlyRate * 30;
    }
  }

  res.json({
    grossSalary: gross,
    incomeTax: Math.round(monthlyTax * 100) / 100,
    incomeTaxRate: config.taxBrackets[config.taxBrackets.length - 1].rate,
    socialInsurance: Math.round(monthlySI * 100) / 100,
    socialInsuranceRate: config.siRate,
    netSalary: Math.round(netSalary * 100) / 100,
    endOfServiceBonus: Math.round(endOfServiceBonus * 100) / 100,
    country,
    breakdown: [
      { label: "Gross Salary", amount: gross },
      { label: "Social Insurance", amount: -Math.round(monthlySI * 100) / 100 },
      { label: "Income Tax", amount: -Math.round(monthlyTax * 100) / 100 },
      { label: "Net Salary", amount: Math.round(netSalary * 100) / 100 },
    ],
  });
});

router.get("/summary", requireAuth, async (req: AuthRequest, res) => {
  const { month } = req.query;
  const targetMonth = String(month ?? new Date().toISOString().slice(0, 7));
  const slips = await db.select().from(payslipsTable).where(and(eq(payslipsTable.tenantId, req.tenantId!)));
  const periodSlips = slips.filter(s => s.period === targetMonth);
  res.json({
    period: targetMonth,
    totalGross: periodSlips.reduce((s, p) => s + Number(p.grossSalary), 0),
    totalNet: periodSlips.reduce((s, p) => s + Number(p.netSalary), 0),
    totalDeductions: periodSlips.reduce((s, p) => s + Number(p.totalDeductions), 0),
    totalTax: periodSlips.reduce((s, p) => s + Number(p.incomeTax), 0),
    totalInsurance: periodSlips.reduce((s, p) => s + Number(p.socialInsurance), 0),
    totalEmployees: periodSlips.length,
    currency: "USD",
  });
});

export default router;
