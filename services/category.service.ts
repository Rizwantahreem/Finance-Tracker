import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";
import { CategorySchema, UpdateCategorySchema } from "../validators/category.validator.js";
import { CategoryModel } from "../models/category.model.js";
import type { DeleteResult } from "mongoose";
import mongoose from "mongoose";

export const createNewCategory = async (reqBody: any, userId: string | null ) => {
    try {
        if (!reqBody) {
            throw new AppError("Invalid body", 400);
        }
        
        const body = CategorySchema.parse(reqBody);
    
        const newCategory = new CategoryModel({
            name: body.name,
            type: body.type,
            userId: userId || null,
            description: body.description,
        });
        
        await newCategory.save();

        return newCategory?._id;
    } catch (error) {
        if (error instanceof ZodError) {
           throw new AppError("Validation failed", 400);
        }
       throw error;
    }
}

export const getAllCategories = async (userId: string, isCustom: boolean, pageNo: number, limit: number) => {
    try {
        if (!userId) {
            new AppError("User not authenticated", 401);
        }
        const query = isCustom ? { userId: new mongoose.Types.ObjectId(userId) } : { userId: null };

        const [categories, totalRecords] = await Promise.all([
            CategoryModel
                .find({...query})
                .skip((pageNo - 1) * limit)
                .limit(limit),
            CategoryModel.countDocuments(query)
        ]) ;
        
        return {
            categories,
            totalRecords
        };
    } catch (error: any) {
        throw new AppError(error?.message || 'server error');
    }
}

export const deleteCategoryById = async (categoryId: string) => {
    try {
        const category: DeleteResult = await CategoryModel.deleteOne({
        _id: categoryId,
        });

        if (category.deletedCount === 0) {
            throw new AppError("No matching category was found.", 404);
        }

    } catch (error) {
        throw error;
    }
}

export const updateCategoryById = async (reqBody: any, categoryId: string) => {
    try {
        const updatedBody = UpdateCategorySchema.parse(reqBody);

        const updatedCategory = await CategoryModel.updateOne(
            { _id: categoryId },
            { $set: updatedBody },
            { runValidators: true }
        );

        if (updatedCategory.matchedCount === 0) {
            throw new AppError(`Category with id ${categoryId} not found.`, 404);
        }
    } catch (error) {
        if (error instanceof ZodError) {
            throw new AppError("Validation failed", 400)
        }
        throw error;
    }
}