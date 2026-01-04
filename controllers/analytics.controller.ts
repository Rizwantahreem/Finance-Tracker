import mongoose, { Aggregate } from "mongoose";
import { TransactionModel } from "../models/transaction.model.js";
import { getEndOfMonth, getStartOfMonth } from "../utils/date.util.js";

export const getSummary = async (req, res, next) => {};

export const getDetailedMonthlyExpenses = async (req, res, next) => {
  try {
    const now = new Date();

    const startOfMonth = getStartOfMonth(now);
    const endOfMonth = getEndOfMonth(now);

    const transactions = await TransactionModel.aggregate([
      //   filter
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req?.user?.id),
          isDeleted: false,
          transactionDate: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        },
      },
      // group
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
        },
      },
      // Join Category collection
      {
        $lookup: {
          from: "$categories", // it's collection name
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      //   flatten category array
      {
        $unwind: "$category",
      },
      //   shape response
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
