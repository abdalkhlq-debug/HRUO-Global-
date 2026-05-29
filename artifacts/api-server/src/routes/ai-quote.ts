import { Router } from "express";
import { db, systemSettingsTable, quoteRequestsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireSuperAdmin, type AuthRequest } from "../middlewares/auth";

const router = Router();

async function getSetting(key: string, fallback: string): Promise<string> {
  const [row] = await db.select().from(systemSettingsTable).where(eq(systemSettingsTable.key, key)).limit(1);
  return row?.value ?? fallback;
}

// POST /api/ai-quote/generate — generate AI-powered quote response
router.post("/generate", requireSuperAdmin, async (req: AuthRequest, res) => {
  const aiEnabled = await getSetting("ai.enabled", "true");
  if (aiEnabled !== "true") {
    res.status(403).json({ error: "AI quote builder is disabled" });
    return;
  }

  const { quoteId, customInstructions } = req.body;
  const [quote] = await db.select().from(quoteRequestsTable).where(eq(quoteRequestsTable.id, Number(quoteId))).limit(1);
  if (!quote) { res.status(404).json({ error: "Quote not found" }); return; }

  const basePrompt = await getSetting("ai.quote_prompt", "Generate a professional quote response.");
  const modules = Array.isArray(quote.modules) ? quote.modules : [];

  const context = `
Company: ${quote.companyName}
Contact: ${quote.contactName} (${quote.email})
Employees: ${quote.employeeCount ?? "Not specified"}
Modules needed: ${modules.join(", ") || "Full suite"}
Message: ${quote.message ?? "N/A"}
${customInstructions ? `\nAdditional instructions: ${customInstructions}` : ""}
  `.trim();

  try {
    const response = await fetch("https://ai.replit.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.REPLIT_AI_API_KEY ?? ""}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: basePrompt },
          { role: "user", content: `Generate a detailed price quote response for:\n\n${context}` }
        ],
        temperature: 0.7,
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
      // Fallback: generate template-based quote
      const text = generateTemplateQuote(quote.companyName, quote.contactName, modules, Number(quote.employeeCount ?? 50));
      res.json({ text, source: "template" });
      return;
    }

    const data = await response.json() as { choices: { message: { content: string } }[] };
    const text = data.choices?.[0]?.message?.content ?? generateTemplateQuote(quote.companyName, quote.contactName, modules, Number(quote.employeeCount ?? 50));
    res.json({ text, source: "ai" });
  } catch {
    const text = generateTemplateQuote(quote.companyName, quote.contactName, modules, Number(quote.employeeCount ?? 50));
    res.json({ text, source: "template" });
  }
});

function generateTemplateQuote(company: string, contact: string, modules: string[], employees: number): string {
  const basePerEmployee = modules.length > 10 ? 12 : modules.length > 5 ? 9 : 6;
  const monthly = employees * basePerEmployee;
  const yearly = monthly * 10;
  const impl = employees > 200 ? "6-8 weeks" : employees > 50 ? "3-4 weeks" : "1-2 weeks";
  const tier = employees > 200 ? "Enterprise" : employees > 50 ? "Growth" : "Starter";

  return `Dear ${contact},

Thank you for your interest in HRUO for ${company}. We are pleased to present our tailored pricing proposal.

PROPOSED PLAN: ${tier}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Employee Count: ${employees}
Selected Modules: ${modules.length ? modules.join(", ") : "Full HCM Suite"}

PRICING:
  • Monthly: $${monthly.toLocaleString()} / month
  • Annual:  $${yearly.toLocaleString()} / year (2 months free)

INCLUDED MODULES:
${(modules.length ? modules : ["Core HR", "Payroll", "Attendance", "Leave"]).map(m => `  ✓ ${m.charAt(0).toUpperCase() + m.slice(1)}`).join("\n")}

IMPLEMENTATION:
  • Timeline: ${impl}
  • Onboarding & training: Included
  • Data migration: Included
  • 24/7 technical support: Included

NEXT STEPS:
  1. Schedule a product demo call
  2. Sign agreement & onboarding kickoff
  3. Data migration & configuration
  4. Go-live & training

To proceed, simply reply to this email or contact us at info@hruo.net.

Best regards,
HRUO Enterprise Sales Team`;
}

// GET /api/ai-quote/status — check if AI is enabled
router.get("/status", async (_req, res) => {
  const enabled = await getSetting("ai.enabled", "true");
  res.json({ enabled: enabled === "true" });
});

export default router;
