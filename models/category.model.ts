import mongoose, { Schema, model } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true, minlength: 3, maxLength: 100 },
    type: { type: String, required: true, enum: ["expense", "income"] },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "user",
    },
    description: { type: String, required: false },
  },
  { timestamps: true }
);

export const CategoryModel = model("category", categorySchema);
