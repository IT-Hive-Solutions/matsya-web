import { z } from "zod";
import { phoneRegex } from "./login.dto";



export const ResetPasswordSchema = z.object({
    phone_number: z.string().regex(phoneRegex, "Enter valid phone number (98XXXXXXXXX or 01XXXXXXXX)"),
    needs_password_change: z.boolean().optional(),
});

export type ResetPasswordDTO = z.infer<typeof ResetPasswordSchema>;
