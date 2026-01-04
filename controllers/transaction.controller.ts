import { TransactionModel } from "../models/transaction.model.js";
import mongoose from "mongoose";
import {
  TransactionSchema,
  UpdateTransactionSchema,
} from "../validators/transaction.validator.js";

// @Desc - Get alltransaction
export const getTransactions = async (req, res, next) => {
  try {
    const transactions = await TransactionModel.find({
      isDeleted: false,
      userID: req.user.userID,
    });
    res
      .status(200)
      .json({ transactions: transactions, message: "Fetched transactions" });
  } catch (error) {
    next({ msg: error.message, status: 500 });
  }
};

// @Desc - Get single transaction
export const getTransaction = async (req, res, next) => {
  const id = req.params.id;
  if (!id) return res.status(400).json({ messaeg: "Invalid ID." });

  try {
    const transaction = await TransactionModel.findById({
      _id: id,
    });

    if (!transaction)
      return res.status(404).json({ message: "No transaction found" });

    res.status(200).json(transaction);
  } catch (error) {
    next({ msg: error.message, status: 404 });
  }
};

// @Desc - Post Create transaction
export const createTransaction = async (req, res, next) => {
  try {
    const body = TransactionSchema.parse(req.body);

    const newTransaction = new TransactionModel({
      amount: body.amount,
      description: body?.description || "",
      type: body.type,
      userId: req?.user?.id,
      category: body.categoryId,
      transactiondate: body.transactiondate,
    });

    await newTransaction.save();
    res.status(201).json({
      message: `transaction with id ${newTransaction._id} created successfully`,
    });
  } catch (error) {
    console.log(error, "aaaa");
    next({ msg: error.message, status: 500 });
  }
};

// @Desc - Delete Create transaction
export const deleteTransaction = async (req, res, next) => {
  const id = req.params.id;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid id" });
  }

  try {
    const transaction = await TransactionModel.updateOne(
      { _id: id, isDeleted: false },
      { isDeleted: true }
    );

    if (transaction.matchedCount == 0) {
      return res.status(404).json({
        message: `Transaction with id ${id} not found or already deleted.`,
      });
    }

    res
      .status(200)
      .json({ message: `Transaction with id ${id} deleted successfully` });
  } catch (error) {
    next({ msg: error.message });
  }
};

// @Desc - Patch request
export const updateTransaction = async (req, res, next) => {
  try {
    const body = UpdateTransactionSchema.parse(req.body);
    const id = req.params.id;

    if (!id || !body || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid value(s)" });
    }

    const transaction = await TransactionModel.updateOne(
      { _id: id, isDeleted: false },
      { $set: body },
      { runValidators: true }
    );

    if (transaction.matchedCount == 0) {
      return res.status(404).json({
        message: `Transaction with id ${id} not found.`,
      });
    }

    res.status(200).json({ message: `transaction with id ${id} updated.` });
  } catch (error) {
    next({ msg: error.message });
  }
};
