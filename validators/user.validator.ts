import { z } from "zod";

export const UserSchema = z.object({
  name: z.string().min(3).max(100),
  email: z.email().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
  password: z.string().min(6),
  age: z.string()?.transform(Number).pipe(z.int().min(10).max(130)),
  role: z.string().max(50),
  phoneNumber: z
    .string()
    .regex(/^[0-9]{10}$/)
    .optional(),
  isEmailVerified: z.boolean().default(false),
});

export const SignInSchema = UserSchema.pick({ email: true, password: true });
