import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import * as crypto from "crypto";
import { createSession, destroySession, requireAuth, SUPER_ADMIN_EMAILS, type AuthRequest } from "../middlewares/auth";

const router = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "hruo_salt").digest("hex");
}

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }

  // Super admin hard-coded check
  const SUPER_ADMIN_PASSWORD_HASH = hashPassword("Hg.8@6U!@mZLShV");
  if (SUPER_ADMIN_EMAILS.includes(email.toLowerCase())) {
    if (hashPassword(password) !== SUPER_ADMIN_PASSWORD_HASH) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const token = createSession(0, email, null, "superadmin");
    res.json({
      token,
      user: {
        id: 0,
        email,
        name: "HRUO Admin",
        role: "superadmin",
        tenantId: null,
        tenantName: null,
        tenantLogo: null,
        isSuperAdmin: true,
        employeeId: null,
      },
    });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  if (!user.active) {
    res.status(403).json({ error: "Account disabled" });
    return;
  }

  const token = createSession(user.id, user.email, user.tenantId, user.role);
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      tenantName: null,
      tenantLogo: null,
      isSuperAdmin: false,
      employeeId: user.employeeId,
    },
  });
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  if (req.isSuperAdmin) {
    res.json({
      id: 0,
      email: req.userEmail,
      name: "HRUO Admin",
      role: "superadmin",
      tenantId: null,
      tenantName: null,
      tenantLogo: null,
      isSuperAdmin: true,
      employeeId: null,
    });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tenantId: user.tenantId,
    tenantName: null,
    tenantLogo: null,
    isSuperAdmin: false,
    employeeId: user.employeeId,
  });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  const token = req.headers.authorization?.slice(7);
  if (token) destroySession(token);
  res.json({ ok: true });
});

export default router;
