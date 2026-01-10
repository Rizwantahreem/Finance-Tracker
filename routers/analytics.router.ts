import { Router } from "express";
import {
  getDetailedMonthlyExpenses,
  getRecentTransactions,
  getSummary,
  getBudgetAndTransactionByCategory,
} from "../controllers/analytics.controller.js";

const analyticRouter = Router();

analyticRouter.get("/summary", getSummary);
analyticRouter.get("/month-in-glance", getDetailedMonthlyExpenses);
analyticRouter.get("/budget-tracking", getBudgetAndTransactionByCategory);
analyticRouter.get("/recent-transactions", getRecentTransactions);

export default analyticRouter;
