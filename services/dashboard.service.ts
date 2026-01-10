import mongoose, { mongo } from "mongoose";
import { TransactionModel } from "../models/transaction.model.js";
import { getStartOfMonth, getEndOfMonth } from "../utils/date.util.js";
import { BudgetModel } from "../models/budget.model.js";
import type { NextFunction } from "express";

export async function getSavingAndExpenses(
  currentdate: Date,
  userId: string,
  next: NextFunction
) {
  try {
    const totalTypesSum = await TransactionModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          isDeleted: false,
          transactionDate: {
            $gte: getStartOfMonth(currentdate),
            $lte: getEndOfMonth(currentdate),
          },
        },
      },
      {
        $group: {
          _id: "$type",
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          type: "$_id",
          totalAmount: 1,
        },
      },
      {
        $sort: {
          type: -1,
        },
      },
    ]);

    return totalTypesSum;
  } catch (error) {
    next({ msg: error.message });
  }
}

export async function getHighlySpentCategory(
  currentDate: Date,
  userId: string,
  next: NextFunction
) {
  try {
    const highlySpentCategory = await TransactionModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          isDeleted: false,
          type: "expense",
          transactionDate: {
            $gte: getStartOfMonth(currentDate),
            $lte: getEndOfMonth(currentDate),
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
        $sort: { totalAmount: -1 },
      },
      { $limit: 1 },
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

    return highlySpentCategory;
  } catch (error) {
    next({ msg: error?.message });
  }
}

export async function getBudgetToSpendingTrack(
  currentDate: Date,
  userId: string,
  next: NextFunction
) {
  try {
    const startOfMonth = getStartOfMonth(currentDate);
    const endOfMonth = getEndOfMonth(currentDate);

    const result = await BudgetModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          isDeleted: false,
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear(),
        },
      },
      {
        $lookup: {
          from: "transactions",
          let: { categoryId: "$category" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$category", "$$categoryId"] },
                    { $eq: ["$isDeleted", false] },
                    { $eq: ["$type", "expense"] },
                    { $gte: ["$transactionDate", startOfMonth] },
                    { $lte: ["$transactionDate", endOfMonth] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                spent: { $sum: "$amount" },
              },
            },
          ],
          as: "spending",
        },
      },
      {
        $addFields: {
          spentAmount: {
            $ifNull: [{ $arrayElemAt: ["$spending.spent", 0] }, 0],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalBudget: { $sum: "$budgetAmount" },
          totalSpent: { $sum: "$spentAmount" },
        },
      },
      {
        $project: {
          _id: 0,
          totalBudget: 1,
          totalSpent: 1,

          budgetDelta: {
            $subtract: ["$totalSpent", "$totalBudget"],
          },

          utilizationPercentage: {
            $cond: [
              { $eq: ["$totalBudget", 0] },
              0,
              {
                $multiply: [{ $divide: ["$totalSpent", "$totalBudget"] }, 100],
              },
            ],
          },

          utilizationSign: {
            $cond: [{ $gt: ["$totalSpent", "$totalBudget"] }, "+", "-"],
          },
        },
      },
    ]);

    return result[0] || 0;
  } catch (error) {
    next({ msg: error.message });
  }
}

export async function getUnbudgetedSpending(
  currentDate: Date,
  userId: string,
  next: NextFunction
) {
  try {
    const UnbudgetedSpendingOfCategories = await TransactionModel.aggregate([
      {
        $match: {
          isDeleted: false,
          type: "expense",
          userId: new mongoose.Types.ObjectId(userId),
          transactionDate: {
            $gte: getStartOfMonth(currentDate),
            $lte: getEndOfMonth(currentDate),
          },
        },
      },
      {
        $lookup: {
          from: "budget",
          let: { categoryId: "$category" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$category", "$categoryId"] },
                    { $eq: ["isDeleted", false] },
                    { $eq: ["userId", new mongoose.Types.ObjectId(userId)] },
                    { $eq: ["month", currentDate?.getMonth() + 1] },
                    { $eq: ["year", currentDate?.getFullYear()] },
                  ],
                },
              },
            },
          ],
          as: "budget",
        },
      },
      // to get rows that have no budget
      {
        $match: {
          budget: { $size: 0 },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          Amount: { $sum: "$totalAmount" },
        },
      },
    ]);

    let unBudgetedSpending = 0;
    for (const obj of UnbudgetedSpendingOfCategories) {
      unBudgetedSpending += Number(obj.Amount);
    }

    return unBudgetedSpending;
  } catch (error) {
    next({ msg: error?.message });
  }
}

export async function getUnusedBudget(
  currentDate: Date,
  userId: string,
  next: NextFunction
) {
  try {
    const budget = await BudgetModel.aggregate([
      // 1️⃣ Match budgets for this month
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          isDeleted: false,
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear(),
        },
      },

      // 2️⃣ Lookup related transactions
      {
        $lookup: {
          from: "transactions",
          let: { categoryId: "$category" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$category", "$$categoryId"] },
                    { $eq: ["$userId", new mongoose.Types.ObjectId(userId)] },
                    { $eq: ["$isDeleted", false] },
                    { $eq: ["$type", "expense"] },
                    {
                      $gte: ["$transactionDate", getStartOfMonth(currentDate)],
                    },
                    { $lte: ["$transactionDate", getEndOfMonth(currentDate)] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                spent: { $sum: "$amount" },
              },
            },
          ],
          as: "spending",
        },
      },

      // 3️⃣ Normalize spentAmount
      {
        $addFields: {
          spentAmount: {
            $ifNull: [{ $arrayElemAt: ["$spending.spent", 0] }, 0],
          },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      { $unwind: "$categoryDetails" },
      {
        $match: {
          "categoryDetails.type": "expense",
        },
      },

      // 4️⃣ Calculate unused budget
      {
        $project: {
          _id: 0,
          category: 1,
          budgetAmount: 1,
          spentAmount: 1,
          unusedBudget: {
            $subtract: ["$budgetAmount", "$spentAmount"],
          },
        },
      },
    ]);

    let unusedBudgetAmount = 0;
    for (const ob of budget) {
      unusedBudgetAmount += ob.unusedBudget;
    }

    return unusedBudgetAmount;
  } catch (error) {
    next({ msg: error.message });
  }
}

export async function getDetailedExpenses(
  currentDate: Date,
  userId: string,
  next: NextFunction
) {
  try {
    const startOfMonth = getStartOfMonth(currentDate);
    const endOfMonth = getEndOfMonth(currentDate);

    const transactions = await TransactionModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          isDeleted: false,
          type: "expense",
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

    return transactions;
  } catch (error) {
    next({ msg: error.message });
  }
}

export async function getBudgetAndTransactionByCategoryData(
  currentDate: Date,
  userId: string,
  next: NextFunction
) {
  try {
    const data = await BudgetModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          isDeleted: false,
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear(),
        },
      },
      {
        $lookup: {
          from: "transactions",
          let: { categoryId: "$category" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$category", "$$categoryId"] },
                    { $eq: ["$isDeleted", false] },
                    {
                      $gte: ["$transactionDate", getStartOfMonth(currentDate)],
                    },
                    { $lte: ["$transactionDate", getEndOfMonth(currentDate)] },
                    { $eq: ["$userId", new mongoose.Types.ObjectId(userId)] },
                    { $eq: ["$type", "expense"] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                transactionSum: { $sum: "$amount" },
              },
            },
          ],
          as: "transaction",
        },
      },
      {
        $addFields: {
          transactionSum: {
            $ifNull: [{ $arrayElemAt: ["$transaction.transactionSum", 0] }, 0],
          },
        },
      },
      {
        $group: {
          _id: "$category",
          budgetSum: { $sum: "$budgetAmount" },
          transactionSum: { $first: "$transactionSum" },
        },
      },
      // { $unwind: "$transaction" },
      // {
      //   $group: {
      //     _id: "$category",
      //     budgetSum: { $sum: "$budgetAmount" },
      //     transactionSum: { $sum: "$transaction.amount" },
      //   },
      // },
      {
        $lookup: {
          from: "categories",
          let: { categoryId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$categoryId"] },
                    { $eq: ["$type", "expense"] },
                  ],
                },
              },
            },
          ],
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $project: {
          _id: 0,
          categoryName: "$category.name",
          budgetSum: 1,
          transactionSum: 1,
        },
      },
    ]);

    console.log(data, "ttt");

    // for (const obj in data) {
    //   console.log(...obj, "aaaaa");
    // }
  } catch (error) {
    next({ msg: error?.message });
  }
}

export async function getLatestTransaction(userId: string, next: NextFunction) {
  try {
    const transactions = await TransactionModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          isDeleted: false,
        },
      },
      { $sort: { CreatedAt: -1 } },
      {
        $lookup: {
          from: "categories",
          let: { id: "$category" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$category", "$$id"] },
                    { $eq: ["$type", "expense"] },
                  ],
                },
              },
            },
          ],
          as: "category",
        },
      },
      { $unwind: "$category" },
      { $limit: 3 },
      {
        $project: {
          _id: 1,
          name: 1,
          amount: 1,
          categoryName: "$category.name",
        },
      },
    ]);

    //   await TransactionModel.find({
    //   userId: userId,
    //   isDeleted: false,
    // }).sort({ CreatedAt: -1 });

    return transactions;
  } catch (error) {
    next({ msg: error.message });
  }
}
