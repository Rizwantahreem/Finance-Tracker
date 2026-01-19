import { ZodError } from "zod";
import { TransactionModel } from "../models/transaction.model.js";
import { AppError } from "../utils/AppError.js";
import { TransactionSchema, UpdateTransactionSchema } from "../validators/transaction.validator.js";
import mongoose from "mongoose";

export const getAllTransactions = async (userId: string, pageNo: number, limit: number) => {
    try {
        const query = { isDeleted: false, userId: userId }

        const [transactions, totalRecords] = await Promise.all([
            TransactionModel.find(query).skip((pageNo - 1) * limit).limit(limit),
            TransactionModel.countDocuments(query)
         ]);

    return { transactions, totalRecords };
    } catch (error) {
        throw error;
    }
}

export const getTransactionById = async (transactionId: string) => {
    try {
        const transaction = await TransactionModel.findById(transactionId);
        
        if (!transaction) {
            throw new AppError("No transaction found", 404);
        }
        return transaction;
    } catch (error) {
        throw error;
    }
}

export const createNewTransaction = async (reqBody: any, userId: string) => {
    try {
        const body = TransactionSchema.parse({
            ...reqBody,
            userId: userId,
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

        return newTransaction?._id;
    } catch (error) {
        if (error instanceof ZodError) {
            throw new AppError("Validation failed", 400);
        }
        throw error;
    }
}


export const deleteTransactionById = async (transactionId: string) => {
    try {
        if (!transactionId || !mongoose.Types.ObjectId.isValid(transactionId)) {
            throw new AppError("Invalid id", 400);
        }
        const transaction = await TransactionModel.updateOne(
            { _id: transactionId, isDeleted: false },
            { isDeleted: true }
        );

        if (transaction.matchedCount === 0) {
            throw  new AppError(
            `Transaction with id ${transactionId} not found or already deleted.`,
            404
            );
        }

    } catch (error) {
        throw error;
    }
}

export const updateTransactionById = async (reqBody: any, transactionId: string) => {
    try {
        const body = UpdateTransactionSchema.parse(reqBody);
        
        if (!transactionId || !body || !mongoose.Types.ObjectId.isValid(transactionId)) {
            throw new AppError("Invalid value(s)", 400);
        }
        
        const transaction = await TransactionModel.updateOne(
            { _id: transactionId, isDeleted: false },
            { $set: body },
            { runValidators: true }
        );
        
        if (transaction.matchedCount === 0) {
            throw new AppError(`Transaction with id ${transactionId} not found.`, 404);
        }
        return transactionId;
    } catch (error) {
        if (error instanceof ZodError) {
            throw new AppError("Validation failed", 400);
        }   
    throw error;
    }
}