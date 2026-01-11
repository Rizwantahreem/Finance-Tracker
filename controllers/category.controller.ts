import type { Request, Response, NextFunction } from "express";
import { CategoryModel } from "../models/category.model.js";
import type { DeleteResult } from "mongoose";
import {
  CategorySchema,
  UpdateCategorySchema,
} from "../validators/category.validator.js";
import { AppError } from "../utils/AppError.js";
import { ZodError } from "zod";

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.body) {
      next(new AppError("Invalid body", 400));
      return;
    }
    const body = CategorySchema.parse(req.body);

    const newCategory = new CategoryModel({
      name: body.name,
      type: body.type,
      userId: req.user?.id || null,
      description: body.description,
    });

    await newCategory.save();

    res
      .status(201)
      .json({ message: `Category with id ${newCategory._id} created` });
  } catch (error) {
    if (error instanceof ZodError) {
      next(new AppError("Validation failed", 400));
      return;
    }
    next(error);
  }
};

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const isCustomFlag = Boolean(req.params.isCustom);
    let categories = [];

    if (isCustomFlag) {
      if (!req.user?.id) {
        next(new AppError("User not authenticated", 401));
        return;
      }
      categories = await CategoryModel.find({ userId: req.user.id });
    } else {
      categories = await CategoryModel.find({});
    }

    res.status(200).json({ message: "categories fetch.", categories });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categoryID = req.params.categoryId;

    const category: DeleteResult = await CategoryModel.deleteOne({
      _id: categoryID,
    });

    if (category.deletedCount === 0) {
      next(new AppError("No matching category was found.", 404));
      return;
    }

    res
      .status(200)
      .json({ message: `Category with id ${categoryID} is deleted.` });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categoryId = req.params.id;
    const updatedBody = UpdateCategorySchema.parse(req.body);

    const updatedCategory = await CategoryModel.updateOne(
      { _id: categoryId },
      { $set: updatedBody },
      { runValidators: true }
    );

    if (updatedCategory.matchedCount === 0) {
      next(new AppError(`Category with id ${categoryId} not found.`, 404));
      return;
    }

    res
      .status(200)
      .json({ message: `Category with id ${categoryId} updated.` });
  } catch (error) {
    if (error instanceof ZodError) {
      next(new AppError("Validation failed", 400));
      return;
    }
    next(error);
  }
};
