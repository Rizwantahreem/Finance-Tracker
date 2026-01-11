import Router from "express";
import {
  getTransactions,
  getTransaction,
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from "../controllers/transaction.controller.js";
import { authorizeUser } from "../middlewares/role-based-access.middleware.js";

const transactionRouter = Router();

// @desc - get all transactions
transactionRouter.get("/", authorizeUser("admin", "user"), getTransactions);

transactionRouter.get("/:id", authorizeUser("admin", "user"), getTransaction);

transactionRouter.post("/", authorizeUser("admin", "user"), createTransaction);

transactionRouter.delete(
  "/:id",
  authorizeUser("admin", "user"),
  deleteTransaction
);

transactionRouter.patch(
  "/:id",
  authorizeUser("admin", "user"),
  updateTransaction
);

export default transactionRouter;
