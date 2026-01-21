import { z } from "zod";
import { phoneRegex } from "./login.dto";



export const ResetPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
    needs_password_change: z.boolean().optional(),
});

export type ResetPasswordDTO = z.infer<typeof ResetPasswordSchema>;
