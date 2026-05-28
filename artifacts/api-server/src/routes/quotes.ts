import { Router } from "express";
import { db, quoteRequestsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

// Public endpoint — no auth required
router.get("/", async (req, res) => {
  const quotes = await db.select().from(quoteRequestsTable).orderBy(desc(quoteRequestsTable.createdAt));
  res.json(quotes.map(q => ({ ...q, modules: Array.isArray(q.modules) ? q.modules : [], createdAt: q.createdAt.toISOString() })));
});

router.post("/", async (req, res) => {
  const [quote] = await db.insert(quoteRequestsTable).values(req.body).returning();
  res.status(201).json({ ...quote, modules: Array.isArray(quote.modules) ? quote.modules : [], createdAt: quote.createdAt.toISOString() });
});

router.patch("/:id", async (req, res) => {
  const [quote] = await db.update(quoteRequestsTable).set(req.body).where(eq(quoteRequestsTable.id, Number(req.params.id))).returning();
  if (!quote) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...quote, modules: Array.isArray(quote.modules) ? quote.modules : [], createdAt: quote.createdAt.toISOString() });
});

export default router;
