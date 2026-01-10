import { TransactionModel } from "../models/transaction.model.js";
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

export const getSummary = async (req, res, next) => {
  const summary: ISummary = {
    totalSavings: 0,
    totalExpenses: 0,
    highlySpentCategory: "",
    budgetToExpenseTracking: "0",
    unbudgetedSpending: 0,
    unUsedBudget: 0,
  };

  try {
    const now = new Date();
    const userId = req?.user?.id;

    const totalTypesSum = await getSavingAndExpenses(now, userId, next);
    const highlySpentCategory = await getHighlySpentCategory(now, userId, next);
    const budgetToTransaction = await getBudgetToSpendingTrack(
      now,
      userId,
      next
    );

    const unbudgetedSpending = await getUnbudgetedSpending(now, userId, next);

    const unUsedBudget = await getUnusedBudget(now, userId, next);

    summary.totalSavings =
      totalTypesSum[0]?.totalAmount - totalTypesSum[1]?.totalAmount;

    summary.totalExpenses = totalTypesSum[1]?.totalAmount;
    summary.highlySpentCategory = highlySpentCategory[0]?.categoryName;

    summary.budgetToExpenseTracking = `${
      budgetToTransaction?.utilizationSign
    }${budgetToTransaction?.utilizationPercentage.toFixed(2)}`;

    summary.unbudgetedSpending = unbudgetedSpending;
    summary.unUsedBudget = unUsedBudget;

    res.json({ summary, message: "Monthly summary fetched." });
  } catch (error) {
    next({ msg: error.message });
  }
};

export const getDetailedMonthlyExpenses = async (req, res, next) => {
  try {
    const time = new Date();

    const transactions = await getDetailedExpenses(time, req?.user?.id, next);

    res.json({ message: "fetched this month expenses", transactions });
  } catch (error) {
    next({ msg: error.message });
  }
};

export const getBudgetAndTransactionByCategory = async (req, res, next) => {
  try {
    const budgetAndTransactionData =
      await getBudgetAndTransactionByCategoryData(
        new Date(),
        req?.user?.id,
        next
      );

    res.json({
      message: "Fetched budget and transaction data.",
      budgetAndTransactionData,
    });
  } catch (error) {
    next({ msg: error?.message });
  }
};

export const getRecentTransactions = async (req, res, next) => {
  try {
    const transactions = await getLatestTransaction(req?.user?.id, next);

    res.status(200).json({
      message: "fetched recent transactions successfully",
      transactions,
    });
  } catch (error) {
    next({ status: 500, msg: error.message });
  }
};
