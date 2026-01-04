import type { NextFunction } from "express";
import { CategoryModel } from "../models/category.model.js";
import type { DeleteResult } from "mongoose";
import {
  CategorySchema,
  UpdateCategorySchema,
} from "../validators/category.validator.js";

export const createCategory = async (
  req: any,
  res: any,
  next: NextFunction
) => {
  try {
    if (!req.body) return res.status(400).json({ message: "Invalid body" });
    const body = CategorySchema.parse(req.body);

    const newCategory = new CategoryModel({
      name: body.name,
      type: body.type,
      userID: req?.user?.id || null,
      description: body.description,
    });

    await newCategory.save();

    res
      .status(201)
      .json({ message: `Category with id ${newCategory._id} created` });
  } catch (error) {
    next({ msg: error.message });
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const isCustomFlag = Boolean(req.params.isCustom);
    let categories = [];

    if (isCustomFlag) {
      categories = await CategoryModel.find({ userId: req?.user?.userId });
    } else categories = await CategoryModel.find({});

    return res.status(200).json({ message: "categories fetch.", categories });
  } catch (error) {
    next({ msg: error.message, status: 500 });
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const categoryID = req.params.categoryId;

    const category: DeleteResult = await CategoryModel.deleteOne({
      _id: categoryID,
    });

    if (category.deletedCount == 0) {
      return res
        .status(404)
        .json({ message: "No matching category was found." });
    }

    res
      .status(200)
      .json({ message: `Category with id ${categoryID} is deleted.` });
  } catch (error) {
    next({ msg: error.message });
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    let updatedBody = UpdateCategorySchema.parse(req.body);

    const updatedCategory = await CategoryModel.updateOne(
      { _id: categoryId },
      { $set: updatedBody },
      { runValidators: true }
    );

    if (updatedCategory.matchedCount == 0) {
      return res
        .status(404)
        .json({ message: `Category with id ${categoryId} not found.` });
    }

    res
      .status(200)
      .json({ message: `Category with id ${categoryId} updated.` });
  } catch (error) {
    next({ msg: error.message });
  }
};
