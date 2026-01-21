import { z } from "zod";


export const phoneRegex = /^(98|01)\d{8,10}$/
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const LoginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().regex(passwordRegex, "Password must be at least 8 characters long, include uppercase, lowercase, number, and special character"),
});

export type LoginDTO = z.infer<typeof LoginSchema>;
