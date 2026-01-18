import { ZodError } from "zod";
import { BudgetModel } from "../models/budget.model.js";
import { AppError } from "../utils/AppError.js";
import { BudgetSchema } from "../validators/budget.validator.js";
import { UpdateBudgetSchema } from '../validators/budget.validator.js';

export const createNewBudget = async (
  userId: string,
  reqbody: any
): Promise<any> => {
  try {
    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const body = BudgetSchema.parse({ ...reqbody, userId: userId });

    const budget = new BudgetModel({
      budgetAmount: body.budgetAmount,
      userId: body.userId,
      month: body.month,
      year: body.year,
      category: body.category,
    });

    await budget.save();
    console.log(budget, typeof budget);
    return budget;
  } catch (error) {
    if (error instanceof ZodError) {
      throw new AppError("Validation failed", 400);
    }
    throw error;
  }
};

export const updateBudgetById = async (budgetId: string, userId: string, reqBody: unknown) => {
 try {
    const id = budgetId;
    const body = UpdateBudgetSchema.parse(reqBody);

    if (!id || !body) {
      throw new AppError("Invalid data.", 400);
    }

    const budget = await BudgetModel.updateOne(
      { _id: id, isDeleted: false },
      { $set: body },
      { runValidators: true }
    );

    if (budget.matchedCount === 0) {
      throw new AppError(`Budget with id ${id} not found.`, 404);
    }

    return budgetId;
 } catch (error) {
   if (error instanceof ZodError) {
      throw new AppError("Validation failed", 400);
    }
    throw error;
 }
}

export const deleteBudgetById = async (budgetId: string) => {
  try {

    if (!budgetId) {
      throw new AppError('Invalid Id', 400);
    }

    const deletedBudget = await BudgetModel.updateOne(
      { _id: budgetId },
      { $set: { isDeleted: true } }
    );

    if (deletedBudget.matchedCount === 0) {
      new AppError(`Budget with id ${budgetId} not found.`, 404);
    }

    return budgetId;
  } catch (error) {
    throw error;
  }
}

export const getBudgetById = async (budgetId: string) => {
  try {
    const budget = await BudgetModel.findOne({ _id: budgetId });
    return budget;
  } catch (error) {
    throw error
  }
}

export const getAllBudgets = async (userId: string) => {
  try {

    if (!userId) {
      throw new AppError("Invalid request.", 400);
    }

    const budgets = await BudgetModel.find(
      { isDeleted: false },
      {
        _id: 1,
        category: 1,
        budgetAmount: 1,
        month: 1,
        year: 1,
      }
    );
    return budgets;
  } catch (error) {
    throw error;
  }
}