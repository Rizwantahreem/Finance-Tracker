import { Router } from "express";
import {
  getexpenseToBudgetComparison,
  getMonthlyExpenses,
  getSummary,
} from "../controllers/analytics.controller.js";

const analyticRouter = Router();

analyticRouter.get("/summary", getSummary);
analyticRouter.get("/month-in-glance", getMonthlyExpenses);
analyticRouter.get("/budget tracking", getexpenseToBudgetComparison);

export default analyticRouter;
