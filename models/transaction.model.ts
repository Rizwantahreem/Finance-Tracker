import mongoose, { Schema } from "mongoose";

interface Transaction extends mongoose.Document {
  amount: number;
  description?: string;
  type: "expense" | "income" | "saving";
  isDeleted: boolean;
  category: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  transactionDate: Date;
}

const transactionSchema = new Schema(
  {
    amount: { type: Number, required: true, max: 99999999, min: 0 },
    description: { type: String, required: false },
    type: {
      type: String,
      required: true,
      enum: ["expense", "income", "saving"],
    },
    isDeleted: { type: Boolean, required: false, default: false },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: function () {
        return this.type === "expense";
      },
      ref: "category",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    transactionDate: { type: Date, required: false, default: Date.now },
  },
  {
    timestamps: true,
    collection: "transactions", // Explicit collection name
  },
);

transactionSchema.index({ userId: 1, transactionDate: -1 });
transactionSchema.index({ userId: 1, isDeleted: 1 });
transactionSchema.index({ userId: 1, type: 1, transactionDate: -1 });

export const TransactionModel =
  mongoose.models.transaction ??
  mongoose.model<Transaction>("transaction", transactionSchema);
