import mongoose, { Schema, model } from "mongoose";

const transactionSchema = new Schema(
  {
    amount: { type: Number, required: true, max: 99999999, min: 0 },
    purpose: { type: String, required: false },
    description: { type: String, required: false },
    type: { type: String, required: true, enum: ["expense", "income"] },
    isDeleted: { type: Boolean, required: false, default: false },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "category",
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    transactionDate: { type: Date, required: false, default: Date.now },
  },
  { timestamps: true }
);

export const TransactionModel = model("Transaction", transactionSchema);
