import { Router } from "express";
import {
  createBudget,
  deleteBudget,
  getBudget,
  getBudgets,
  updateBudget,
} from "../controllers/budget.controller.js";

const budgetRouter = Router();

budgetRouter.post("/", createBudget);
budgetRouter.get("/", getBudgets);
budgetRouter.get("/:id", getBudget);
budgetRouter.patch("/:id", updateBudget);
budgetRouter.delete("/:id", deleteBudget);

export default budgetRouter;
