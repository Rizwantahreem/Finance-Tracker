import { z } from "zod";

export const BudgetSchema = z.object({
  category: z.string(),
  userId: z.string(),
  budgetAmount: z.coerce.number().int().min(0),
  spentAmount: z.coerce.number().int().min(0),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isDeleted: z.coerce.boolean().default(false),
  isCompleted: z.boolean().default(false),
});

export const UpdateBudgetSchema = BudgetSchema.omit({ userId: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
