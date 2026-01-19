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

// @desc - get all transactions with pagination (path params)
transactionRouter.get("/pageNo/:pageNo/limit/:limit", authorizeUser("admin", "user"), getTransactions);

// @desc - get all transactions (query params or no params)
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
