import { Router } from "express";
import { db, jobsTable, applicantsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/jobs", requireAuth, async (req: AuthRequest, res) => {
  const jobs = await db.select().from(jobsTable).where(eq(jobsTable.tenantId, req.tenantId!)).orderBy(jobsTable.createdAt);
  const applicants = await db.select({ id: applicantsTable.id, jobId: applicantsTable.jobId }).from(applicantsTable).where(eq(applicantsTable.tenantId, req.tenantId!));
  res.json(jobs.map(j => ({ ...j, applicantCount: applicants.filter(a => a.jobId === j.id).length, createdAt: j.createdAt.toISOString() })));
});

router.post("/jobs", requireAuth, async (req: AuthRequest, res) => {
  const [job] = await db.insert(jobsTable).values({ ...req.body, tenantId: req.tenantId! }).returning();
  res.status(201).json({ ...job, applicantCount: 0, createdAt: job.createdAt.toISOString() });
});

router.patch("/jobs/:id", requireAuth, async (req: AuthRequest, res) => {
  const [job] = await db.update(jobsTable).set(req.body).where(and(eq(jobsTable.id, Number(req.params.id)), eq(jobsTable.tenantId, req.tenantId!))).returning();
  if (!job) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...job, applicantCount: 0, createdAt: job.createdAt.toISOString() });
});

router.get("/applicants", requireAuth, async (req: AuthRequest, res) => {
  const { jobId, stage } = req.query;
  let conditions: any[] = [eq(applicantsTable.tenantId, req.tenantId!)];
  if (jobId) conditions.push(eq(applicantsTable.jobId, Number(jobId)));
  if (stage) conditions.push(eq(applicantsTable.stage, String(stage)));

  const apps = await db.select().from(applicantsTable).where(and(...conditions)).orderBy(applicantsTable.appliedAt);
  const jobs = await db.select({ id: jobsTable.id, title: jobsTable.title }).from(jobsTable).where(eq(jobsTable.tenantId, req.tenantId!));

  res.json(apps.map(a => {
    const job = jobs.find(j => j.id === a.jobId);
    return { ...a, rating: a.rating ? Number(a.rating) : null, jobTitle: job?.title ?? null, appliedAt: a.appliedAt.toISOString() };
  }));
});

router.post("/applicants", requireAuth, async (req: AuthRequest, res) => {
  const [app] = await db.insert(applicantsTable).values({ ...req.body, tenantId: req.tenantId! }).returning();
  res.status(201).json({ ...app, rating: null, jobTitle: null, appliedAt: app.appliedAt.toISOString() });
});

router.patch("/applicants/:id", requireAuth, async (req: AuthRequest, res) => {
  const [app] = await db.update(applicantsTable).set(req.body).where(and(eq(applicantsTable.id, Number(req.params.id)), eq(applicantsTable.tenantId, req.tenantId!))).returning();
  if (!app) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...app, rating: app.rating ? Number(app.rating) : null, appliedAt: app.appliedAt.toISOString() });
});

export default router;
