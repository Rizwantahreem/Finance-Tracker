import mongoose, { Schema } from "mongoose";

const budgetSchema: Schema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "category",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    budgetAmount: { type: Number, min: 0, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    isDeleted: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

budgetSchema.pre("save", async function () {
  const Category = mongoose.models.category;
  const Budget = mongoose.models.budget;

  if (!Category) {
    throw new Error("Category model is not registered");
  }

  const category = await Category.findById(this.category);

  if (!category || category.type !== "expense") {
    throw new Error("Budget can only be created for expense categories");
  }

  const exists = await Budget.findOne({
    userId: this.userId,
    category: this.category,
    month: this.month,
    year: this.year,
    isDeleted: false,
    _id: { $ne: this._id },
  });

  if (exists) {
    throw new Error("Budget already exists for this category and month");
  }
});

export const BudgetModel = mongoose.model("budget", budgetSchema);
