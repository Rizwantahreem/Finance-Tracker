import { z } from "zod";

export const CategoryTypeEnum = z.enum(["expense", "income"]);

export const CategorySchema = z.object({
  name: z.string().min(3).max(100),
  type: CategoryTypeEnum,
  userId: z.string().optional(),
  description: z.string().optional(),
});

export const UpdateCategorySchema = CategorySchema.omit({
  userId: true,
})
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
