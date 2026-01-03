import { BudgetModel } from "../models/budget.model.js";
import {
  BudgetSchema,
  UpdateBudgetSchema,
} from "../validators/budget.validator.js";

// @DESC - POST create new budget
export const createBudget = async (req, res, next) => {
  try {
    const body = BudgetSchema.parse({ ...req.body, userId: req?.user?.id });

    const budget = new BudgetModel({
      budgetAmount: body.budgetAmount,
      spentAmount: body.spentAmount,
      userId: body.userId,
      startDate: body.startDate,
      endDate: body.endDate,
      category: body.category,
    });

    await budget.save();

    res.status(201).json({ message: `Budget with id ${budget._id} created.` });
  } catch (error) {
    next({ msg: error.message });
  }
};

// @DESC - update the budget
// route - PATCH: '/:id'
export const updateBudget = async (req, res, next) => {
  try {
    const id = req.params.id;
    const body = UpdateBudgetSchema.parse(req.body);

    if (!id || !body) {
      next({ status: 400, msg: "Invalid data." });
    }

    const budget = await BudgetModel.updateOne(
      { _id: id, isDeleted: false },
      { $set: body },
      { runValidators: true }
    );

    if (budget.matchedCount == 0) {
      next({ status: 404, msg: `Budget with id ${id} not found.` });
    }

    res.status(200).json({ message: `Budget with id ${id} updated.` });
  } catch (error) {
    next({ msg: error.message });
  }
};

// @DESC - DELETE: soft delete the budget
export const deleteBudget = async (req, res, next) => {
  try {
    const id = req.params.id;

    const deletedBudget = await BudgetModel.updateOne(
      { _id: id },
      { $set: { isDeleted: true } }
    );

    if (deletedBudget.matchedCount == 0) {
      next({ status: 404, msg: `Budget with id ${id} not found.` });
    }

    res.status(200).json({ message: `Budget with id ${id} deleted.` });
  } catch (error) {
    next({ msg: error.message });
  }
};

// @DESC - get budget
// route -  GET: '/:id'
export const getBudget = async (req, res, next) => {
  try {
    const id = req.params.id;
    const budget = await BudgetModel.findOne({ _id: id });

    res.status(200).json({ message: `Budget with id ${id} found.`, budget });
  } catch (error) {
    next({ msg: error.message });
  }
};

// @DESC - get all budgets
export const getBudgets = async (req, res, next) => {
  try {
    const budget = await BudgetModel.find({ isDeleted: false });

    res.status(200).json({ message: `Budgets found.`, budget });
  } catch (error) {
    next({ msg: error.message });
  }
};
