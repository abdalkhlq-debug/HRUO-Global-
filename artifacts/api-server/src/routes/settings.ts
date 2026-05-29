import { Router } from "express";
import { db, systemSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireSuperAdmin, type AuthRequest } from "../middlewares/auth";

const router = Router();

const DEFAULT_SETTINGS: Record<string, string> = {
  "ai.enabled": "true",
  "ai.model": "gpt-4o-mini",
  "ai.quote_prompt": "You are an HRUO pricing assistant. Generate a professional, detailed quote based on the customer request. Include pricing breakdown, implementation timeline, and support details.",
  "social.facebook": "",
  "social.linkedin": "",
  "social.whatsapp": "",
  "social.instagram": "",
  "social.tiktok": "",
  "social.youtube": "",
  "social.twitter": "",
  "email.quote_recipient": "info@hruo.net",
  "email.support_recipient": "support@hruo.net",
  "seo.title": "HRUO - Enterprise HCM System",
  "seo.description": "The complete human capital management platform for complex workforces.",
  "seo.keywords": "HCM, HR software, payroll, employee management, HRMS",
};

// GET all settings
router.get("/", requireSuperAdmin, async (_req, res) => {
  const rows = await db.select().from(systemSettingsTable);
  const result: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    result[row.key] = row.value ?? "";
  }
  res.json(result);
});

// PATCH one or more settings
router.patch("/", requireSuperAdmin, async (req: AuthRequest, res) => {
  const updates: Record<string, string> = req.body;
  for (const [key, value] of Object.entries(updates)) {
    await db.insert(systemSettingsTable)
      .values({ key, value: String(value), category: key.split(".")[0] })
      .onConflictDoUpdate({ target: systemSettingsTable.key, set: { value: String(value), updatedAt: new Date() } });
  }
  // Return updated
  const rows = await db.select().from(systemSettingsTable);
  const result: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const row of rows) result[row.key] = row.value ?? "";
  res.json(result);
});

// Public: get social links (for landing page)
router.get("/social", async (_req, res) => {
  const rows = await db.select().from(systemSettingsTable).where(eq(systemSettingsTable.category, "social"));
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) {
    if (k.startsWith("social.")) result[k.replace("social.", "")] = v;
  }
  for (const row of rows) result[row.key.replace("social.", "")] = row.value ?? "";
  res.json(result);
});

// Public: get SEO settings
router.get("/seo", async (_req, res) => {
  const rows = await db.select().from(systemSettingsTable).where(eq(systemSettingsTable.category, "seo"));
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) {
    if (k.startsWith("seo.")) result[k.replace("seo.", "")] = v;
  }
  for (const row of rows) result[row.key.replace("seo.", "")] = row.value ?? "";
  res.json(result);
});

export default router;
