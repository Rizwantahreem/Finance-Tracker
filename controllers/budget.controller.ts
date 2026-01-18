import type { Request, Response, NextFunction } from "express";
import { 
  createNewBudget, 
  deleteBudgetById, 
  getAllBudgets, 
  getBudgetById, 
  updateBudgetById 
} from "../services/budget.service.js";

// @DESC - POST create new budget
export const createBudget = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const budget = await createNewBudget(req?.user?.id || "", req.body);

    res.status(201).json({ message: `Budget with id ${budget._id} created.` });
  } catch (error) {
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
    
    const id = await updateBudgetById(req?.params?.id || '', req?.user?.id || '', req?.body)
    res.status(200).json({ message: `Budget with id ${id} updated.` });
  } catch (error) {
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
    
    const id = await deleteBudgetById(req?.params?.id || '')
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
    const budget = await getBudgetById(req.params.id || '');
    res.status(200).json({ message: `Budget with id ${req.params.id} found.`, budget });

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
    const budget = await getAllBudgets(req?.user?.id || '');

    res.status(200).json({ message: `Budgets found.`, budget });
  } catch (error) {
    next(error);
  }
};
