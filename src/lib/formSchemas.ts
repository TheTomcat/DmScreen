
import { z } from "zod";

export const loginFormSchema = z.object({
    username: z.string().min(2),
    password: z.string().min(4)
});
export type LoginFormSchema = typeof loginFormSchema