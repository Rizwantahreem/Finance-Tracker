import { TransactionModel } from "../models/transaction.model.js";
import mongoose from "mongoose";
import type { Request, Response, NextFunction } from "express";
import {
  TransactionSchema,
  UpdateTransactionSchema,
} from "../validators/transaction.validator.js";
import { AppError } from "../utils/AppError.js";
import { ZodError } from "zod";

// @Desc - Get all transactions
export const getTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.id) {
      next(new AppError("User not authenticated", 401));
      return;
    }

    const transactions = await TransactionModel.find({
      isDeleted: false,
      userId: req.user.id,
    });
    res
      .status(200)
      .json({ transactions: transactions, message: "Fetched transactions" });
  } catch (error) {
    next(error);
  }
};

// @Desc - Get single transaction
export const getTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const id = req.params.id;
  if (!id) {
    next(new AppError("Invalid ID.", 400));
    return;
  }

  try {
    const transaction = await TransactionModel.findById(id);

    if (!transaction) {
      next(new AppError("No transaction found", 404));
      return;
    }

    res.status(200).json(transaction);
  } catch (error) {
    next(error);
  }
};

// @Desc - Post Create transaction
export const createTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.id) {
      next(new AppError("User not authenticated", 401));
      return;
    }

    const body = TransactionSchema.parse({
      ...req.body,
      userId: req.user.id,
    });

    const newTransaction = new TransactionModel({
      amount: body.amount,
      description: body.description || "",
      type: body.type,
      userId: body.userId,
      category: body.categoryId,
      transactionDate: body.transactionDate,
    });

    await newTransaction.save();
    res.status(201).json({
      message: `transaction with id ${newTransaction._id} created successfully`,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      next(new AppError("Validation failed", 400));
      return;
    }
    next(error);
  }
};

// @Desc - Delete transaction
export const deleteTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const id = req.params.id;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    next(new AppError("Invalid id", 400));
    return;
  }

  try {
    const transaction = await TransactionModel.updateOne(
      { _id: id, isDeleted: false },
      { isDeleted: true }
    );

    if (transaction.matchedCount === 0) {
      next(
        new AppError(
          `Transaction with id ${id} not found or already deleted.`,
          404
        )
      );
      return;
    }

    res
      .status(200)
      .json({ message: `Transaction with id ${id} deleted successfully` });
  } catch (error) {
    next(error);
  }
};

// @Desc - Patch request
export const updateTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body = UpdateTransactionSchema.parse(req.body);
    const id = req.params.id;

    if (!id || !body || !mongoose.Types.ObjectId.isValid(id)) {
      next(new AppError("Invalid value(s)", 400));
      return;
    }

    const transaction = await TransactionModel.updateOne(
      { _id: id, isDeleted: false },
      { $set: body },
      { runValidators: true }
    );

    if (transaction.matchedCount === 0) {
      next(new AppError(`Transaction with id ${id} not found.`, 404));
      return;
    }

    res.status(200).json({ message: `transaction with id ${id} updated.` });
  } catch (error) {
    if (error instanceof ZodError) {
      next(new AppError("Validation failed", 400));
      return;
    }
    next(error);
  }
};
