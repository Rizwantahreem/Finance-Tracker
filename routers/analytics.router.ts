import { Router } from "express";
import {
  getexpenseToBudgetComparison,
  getDetailedMonthlyExpenses,
  getRecentTransactions,
  getSummary,
} from "../controllers/analytics.controller.js";

const analyticRouter = Router();

analyticRouter.get("/summary", getSummary);
analyticRouter.get("/month-in-glance", getDetailedMonthlyExpenses);
analyticRouter.get("/budget tracking", getexpenseToBudgetComparison);
analyticRouter.get("/recent-transactions", getRecentTransactions);

export default analyticRouter;
