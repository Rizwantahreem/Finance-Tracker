import type { NextFunction } from "express";
import { CategoryModel } from "../models/category.model.js";
import type { DeleteResult } from "mongoose";

export const createCategory = async (
  req: any,
  res: any,
  next: NextFunction
) => {
  try {
    if (!req.body) return res.status(400).json({ message: "Invalid body" });

    const newCategory = new CategoryModel({
      name: req.body.name,
      type: req.body.type,
      userID: req?.user?.id || null,
      description: req.body.description,
    });

    await newCategory.save();

    res
      .status(201)
      .json({ message: `Category with id ${newCategory._id} created` });
  } catch (error) {
    console.log(error, "aaaaaaaa");
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

// export const updateCategory = async (req, res, )
