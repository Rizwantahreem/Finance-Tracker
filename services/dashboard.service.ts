import mongoose from "mongoose";
import { TransactionModel } from "../models/transaction.model.js";
import { getStartOfMonth, getEndOfMonth } from "../utils/date.util.js";

export async function getSavingAndExpenses(currentdate: Date, userId: string) {
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
}

export async function getHighlySpentCategory(
  currentDate: Date,
  userId: string
) {
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
}

export async function getBudgetToSpendingTrack(
  currentDate: Date,
  userId: string
) {
  const track = await TransactionModel.aggregate([
    {
      $match: {
        isDeleted: false,
        userId: userId,
        transactionDate: {
          $gte: getStartOfMonth(currentDate),
          $lte: getEndOfMonth(currentDate),
        },
      },
    },
  ]);

  return track;
}
