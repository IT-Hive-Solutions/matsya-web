import { z } from "zod";
import { passwordRegex, phoneRegex } from "./login.dto";



export const ForgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
    old_password: z.string().regex(passwordRegex, "Password must be at least 8 characters long, include uppercase, lowercase, number, and special character"),
    new_password: z.string().regex(passwordRegex, "Password must be at least 8 characters long, include uppercase, lowercase, number, and special character"),
    confirm_new_password: z.string(),
}).superRefine((data, ctx) => {
    if (data.confirm_new_password !== data.new_password) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["confirm_new_password"],
            message: "Passwords do not match",
        });
    }
});

export type ForgotPasswordDTO = z.infer<typeof ForgotPasswordSchema>;
