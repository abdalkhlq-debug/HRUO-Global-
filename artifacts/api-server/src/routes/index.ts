import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import employeesRouter from "./employees";
import orgRouter from "./org";
import leaveRouter from "./leave";
import attendanceRouter from "./attendance";
import payrollRouter from "./payroll";
import recruitmentRouter from "./recruitment";
import expensesRouter from "./expenses";
import performanceRouter from "./performance";
import trainingRouter from "./training";
import collaborationRouter from "./collaboration";
import analyticsRouter from "./analytics";
import superadminRouter from "./superadmin";
import quotesRouter from "./quotes";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/employees", employeesRouter);
router.use("/org", orgRouter);
router.use("/leave", leaveRouter);
router.use("/attendance", attendanceRouter);
router.use("/payroll", payrollRouter);
router.use("/recruitment", recruitmentRouter);
router.use("/expenses", expensesRouter);
router.use("/performance", performanceRouter);
router.use("/training", trainingRouter);
router.use("/collab", collaborationRouter);
router.use("/analytics", analyticsRouter);
router.use("/superadmin", superadminRouter);
router.use("/quotes", quotesRouter);

export default router;
