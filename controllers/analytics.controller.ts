import type { Request, Response, NextFunction } from "express";
import type { ISummary } from "../constants/dashboard.interface.js";
import {
  getBudgetToSpendingTrack,
  getHighlySpentCategory,
  getSavingAndExpenses,
  getUnbudgetedSpending,
  getUnusedBudget,
  getDetailedExpenses,
  getBudgetAndTransactionByCategoryData,
  getLatestTransaction,
} from "../services/dashboard.service.js";
import { AppError } from "../utils/AppError.js";

export const getSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const summary: ISummary = {
    totalSavings: 0,
    totalExpenses: 0,
    highlySpentCategory: "",
    budgetToExpenseTracking: "0",
    unbudgetedSpending: 0,
    unUsedBudget: 0,
  };

  try {
    if (!req.user?.id) {
      next(new AppError("User not authenticated", 401));
      return;
    }

    const now = new Date();
    const userId = req.user.id;

    const totalTypesSum = await getSavingAndExpenses(now, userId);
    const highlySpentCategory = await getHighlySpentCategory(now, userId);
    const budgetToTransaction = await getBudgetToSpendingTrack(now, userId);

    const unbudgetedSpending = await getUnbudgetedSpending(now, userId);

    const unUsedBudget = await getUnusedBudget(now, userId);

    const amountByType = (totalTypesSum ?? []).reduce<Record<string, number>>(
      (acc, item: { type?: string; totalAmount?: number }) => {
        if (item?.type) {
          acc[item.type] = Number(item.totalAmount ?? 0);
        }
        return acc;
      },
      {}
    );
    const savingsAmount = amountByType.saving ?? amountByType.income ?? 0;
    const expenseAmount = amountByType.expense ?? 0;

    summary.totalSavings = savingsAmount - expenseAmount;
    summary.totalExpenses = expenseAmount;
    summary.highlySpentCategory = highlySpentCategory
      ? highlySpentCategory[0]?.categoryName
      : "";

    const utilizationSign = budgetToTransaction?.utilizationSign ?? "-";
    const utilizationPercentage =
      typeof budgetToTransaction?.utilizationPercentage === "number"
        ? budgetToTransaction.utilizationPercentage
        : 0;
    summary.budgetToExpenseTracking = `${utilizationSign}${utilizationPercentage.toFixed(2)}`;

    summary.unbudgetedSpending = unbudgetedSpending || 0;
    summary.unUsedBudget = unUsedBudget || 0;

    res.json({ summary, message: "Monthly summary fetched." });
  } catch (error) {
    next(error);
  }
};

export const getDetailedMonthlyExpenses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.id) {
      next(new AppError("User not authenticated", 401));
      return;
    }

    const time = new Date();
    const transactions = await getDetailedExpenses(time, req.user.id);

    res.json({ message: "fetched this month expenses", transactions });
  } catch (error) {
    next(error);
  }
};

export const getBudgetAndTransactionByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.id) {
      next(new AppError("User not authenticated", 401));
      return;
    }

    const budgetAndTransactionData =
      await getBudgetAndTransactionByCategoryData(new Date(), req.user.id);

    res.json({
      message: "Fetched budget and transaction data.",
      budgetAndTransactionData,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecentTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.id) {
      next(new AppError("User not authenticated", 401));
      return;
    }

    const transactions = await getLatestTransaction(req.user.id);

    res.status(200).json({
      message: "fetched recent transactions successfully",
      transactions,
    });
  } catch (error) {
    next(error);
  }
};
