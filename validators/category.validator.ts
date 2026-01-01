import { z } from "zod";

export const category = z.object({
  name: z.string().min(3),
});
