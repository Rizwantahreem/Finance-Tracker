import { z } from "zod";

export const ExpenseTransactionSchema = z.object({
  amount: z.coerce.number().min(0).max(99999999),
  description: z.string().optional(),
  type: z.literal("expense"),
  categoryId: z.string(), // REQUIRED
  userId: z.string(),
  isDeleted: z.boolean()?.default(false),
  transactionDate: z.coerce.date().default(() => new Date()),
});

export const IncomeTransactionSchema = z.object({
  amount: z.coerce.number().min(0).max(99999999),
  description: z.string().optional(),
  type: z.literal("income"),
  isDeleted: z.boolean()?.default(false),
  categoryId: z.undefined().optional(), // NOT allowed
  userId: z.string(),
  transactionDate: z.coerce.date().default(() => new Date()),
});

export const TransactionSchema = z.discriminatedUnion("type", [
  ExpenseTransactionSchema,
  IncomeTransactionSchema,
]);

const UpdateExpenseTransactionSchema = ExpenseTransactionSchema.omit({
  userId: true,
  isDeleted: true,
}).partial();

const UpdateIncomeTransactionSchema = IncomeTransactionSchema.omit({
  userId: true,
  isDeleted: true,
}).partial();

export const UpdateTransactionSchema = z
  .union([UpdateExpenseTransactionSchema, UpdateIncomeTransactionSchema])
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
