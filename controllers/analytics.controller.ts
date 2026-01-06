import mongoose from "mongoose";
import { TransactionModel } from "../models/transaction.model.js";
import { getEndOfMonth, getStartOfMonth } from "../utils/date.util.js";
import type { ISummary } from "../constants/dashboard.interface.js";
import {
  getHighlySpentCategory,
  getSavingAndExpenses,
} from "../services/dashboard.service.js";

export const getSummary = async (req, res, next) => {
  const summary: ISummary = {
    totalSavings: 0,
    totalExpenses: 0,
    highlySpentCategory: "",
    budgetToExpenseTracking: 0,
  };
  try {
    const now = new Date();

    const totalTypesSum = await getSavingAndExpenses(now, req?.user?.id);
    const highlySpentCategory = await getHighlySpentCategory(
      now,
      req?.user?.id
    );

    summary.totalSavings =
      totalTypesSum[0]?.totalAmount - totalTypesSum[1]?.totalAmount;
    summary.totalExpenses = totalTypesSum[1]?.totalAmount;
    summary.highlySpentCategory = highlySpentCategory[0]?.categoryName;

    res.json({ summary, message: "Monthly summary fetched." });
  } catch (error) {
    next({ msg: error.message });
  }
};

export const getDetailedMonthlyExpenses = async (req, res, next) => {
  try {
    const now = new Date();

    const startOfMonth = getStartOfMonth(now);
    const endOfMonth = getEndOfMonth(now);

    const transactions = await TransactionModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id),
          isDeleted: false,
          transactionDate: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        },
      },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $project: {
          _id: 0,
          categoryId: "$category._id",
          categoryName: "$category.name",
          totalAmount: 1,
        },
      },
    ]);

    res.json({ message: "fetched this month expenses", transactions });
  } catch (error) {
    next({ msg: error.message });
  }
};

export const getexpenseToBudgetComparison = async (req, res, next) => {};

export const getRecentTransactions = async (req, res, next) => {
  try {
    const transactions = await TransactionModel.find({
      userId: req.user.id,
      isDeleted: false,
    }).sort({ CreatedAt: -1 });

    res.status(200).json({
      message: "fetched recent transactions successfully",
      transactions,
    });
  } catch (error) {
    next({ status: 500, msg: error.message });
  }
};
