import mongoose, { Schema } from "mongoose";

export interface Category extends mongoose.Document {
  name: string;
  type: "expense" | "income" | "saving";
  userId?: mongoose.Types.ObjectId;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const categorySchema = new Schema(
  {
    name: { type: String, required: true, minlength: 3, maxLength: 100 },
    type: {
      type: String,
      required: true,
      enum: ["expense", "income", "saving"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "user",
    },
    description: { type: String, required: false },
  },
  {
    timestamps: true,
    collection: "categories", // Explicit collection name
  },
);

export const CategoryModel =
  mongoose.models.category ??
  mongoose.model<Category>("category", categorySchema);
