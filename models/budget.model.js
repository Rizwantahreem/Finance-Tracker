import mongoose from "mongoose";
import { category } from "./category.model";

const budgetSchema = new mongoose.Schema(
  {
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
    amountSet: { type: Number, min: 0, required: true },
    amountSpent: { type: Number, min: 0, required: true },
    startgDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isCompleted: {
      type: Boolean,
      default: false, // Whether the budget period is over and the goal has been reached
    },
  },
  { timestamps: true }
);

export const BudgetModel = mongoose.model(budgetSchema, "budget");

// To ensure the amountSpent in the Budget schema is automatically updated based on user transactions, we can set up a system where:
// Every time a new transaction is added, the app checks if there's an active budget for that category.
// If there is an active budget, it updates the amountSpent for that budget.
// If the user deletes or updates a transaction, the app re-calculates the amountSpent accordingly.
