import type { Request, Response, NextFunction } from "express";
import { BudgetModel } from "../models/budget.model.js";
import {
  BudgetSchema,
  UpdateBudgetSchema,
} from "../validators/budget.validator.js";
import { AppError } from "../utils/AppError.js";
import { ZodError } from "zod";

// @DESC - POST create new budget
export const createBudget = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.id) {
      next(new AppError("User not authenticated", 401));
      return;
    }

    const body = BudgetSchema.parse({ ...req.body, userId: req.user.id });

    const budget = new BudgetModel({
      budgetAmount: body.budgetAmount,
      userId: body.userId,
      month: body.month,
      year: body.year,
      category: body.category,
    });

    await budget.save();

    res.status(201).json({ message: `Budget with id ${budget._id} created.` });
  } catch (error) {
    if (error instanceof ZodError) {
      next(new AppError("Validation failed", 400));
      return;
    }
    next(error);
  }
};

// @DESC - update the budget
// route - PATCH: '/:id'
export const updateBudget = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id;
    const body = UpdateBudgetSchema.parse(req.body);

    if (!id || !body) {
      next(new AppError("Invalid data.", 400));
      return;
    }

    const budget = await BudgetModel.updateOne(
      { _id: id, isDeleted: false },
      { $set: body },
      { runValidators: true }
    );

    if (budget.matchedCount === 0) {
      next(new AppError(`Budget with id ${id} not found.`, 404));
      return;
    }

    res.status(200).json({ message: `Budget with id ${id} updated.` });
  } catch (error) {
    if (error instanceof ZodError) {
      next(new AppError("Validation failed", 400));
      return;
    }
    next(error);
  }
};

// @DESC - DELETE: soft delete the budget
export const deleteBudget = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id;

    const deletedBudget = await BudgetModel.updateOne(
      { _id: id },
      { $set: { isDeleted: true } }
    );

    if (deletedBudget.matchedCount === 0) {
      next(new AppError(`Budget with id ${id} not found.`, 404));
      return;
    }

    res.status(200).json({ message: `Budget with id ${id} deleted.` });
  } catch (error) {
    next(error);
  }
};

// @DESC - get budget
// route -  GET: '/:id'
export const getBudget = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id;
    const budget = await BudgetModel.findOne({ _id: id });

    res.status(200).json({ message: `Budget with id ${id} found.`, budget });
  } catch (error) {
    next(error);
  }
};

// @DESC - get all budgets
export const getBudgets = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const budget = await BudgetModel.find(
      { isDeleted: false },
      {
        _id: 1,
        category: 1,
        budgetAmount: 1,
        month: 1,
        year: 1,
      }
    );

    res.status(200).json({ message: `Budgets found.`, budget });
  } catch (error) {
    next(error);
  }
};
