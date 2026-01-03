import { z } from "zod";
import { CategoryTypeEnum } from "./category.validator.js";

export const TransactionSchema = z.object({
  amount: z.coerce.number().max(99999999).min(0),
  description: z.string().optional(),
  type: CategoryTypeEnum,
  isDeleted: z.boolean().optional().default(false),
  categoryId: z.string(),
  userId: z.string()?.optional(),
  transactiondate: z.coerce.date().default(() => new Date()), // by default functions are lazy loaded in zod
});

export const UpdateTransactionSchema = TransactionSchema.omit({
  isDeleted: true,
  userId: true,
})
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
