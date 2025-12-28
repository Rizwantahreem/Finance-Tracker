import type { NextFunction } from "express";
import { CategoryModel } from "../models/category.model.js";

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
