import { z } from "zod";
import { USER_TYPES } from "../interfaces/user.interface";

export const CreateUserSchema = z.object({
    full_name: z.string().min(3, "Name must be at least 3 characters long"),
    email: z.string().email("Invalid email address"),
    phone_number: z.string({ required_error: "Phone Number is required!" }),
    office_id: z.number({ required_error: "Office is required!" }),
    user_type: z.enum(USER_TYPES, { required_error: "User type is required!" }),
});

export type CreateUserDTO = z.infer<typeof CreateUserSchema>;
