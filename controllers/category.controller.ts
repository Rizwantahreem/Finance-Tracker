import type { Request, Response, NextFunction } from "express";
import { CategoryModel } from "../models/category.model.js";
import type { DeleteResult } from "mongoose";
import {
  CategorySchema,
  UpdateCategorySchema,
} from "../validators/category.validator.js";
import { AppError } from "../utils/AppError.js";
import { ZodError } from "zod";
import { createNewCategory, deleteCategoryById, getAllCategories, updateCategoryById } from "../services/category.service.js";

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = await createNewCategory(req?.body, req?.user?.id || null);
    res
      .status(201)
      .json({ message: `Category with id ${id} created` });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const isCustomFlag = req?.params?.isCustom?.toLowerCase() == "true" ? true : false;
    const pageNo = Number(req?.params?.pageNo);
    const limit = Number(req?.params?.limit);

    const categoriesData = await getAllCategories(req?.user?.id || '', isCustomFlag, pageNo, limit);

    res.status(200).json({
      message: "categories fetch.",
      categories: categoriesData?.categories,
      totalRecord: categoriesData?.totalRecords
    });
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
    const categoryID = req.params.categoryId || '';

    await deleteCategoryById(categoryID);
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
    const categoryId = req.params.id || '';
    await updateCategoryById(req?.body, categoryId);

    res
      .status(200)
      .json({ message: `Category with id ${categoryId} updated.` });
  } catch (error) {
    next(error);
  }
};
