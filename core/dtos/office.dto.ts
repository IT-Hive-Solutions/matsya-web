import { z } from "zod";

export const CreateOfficeSchema = z.object({
    office_name: z.string().min(3, "Name must be at least 3 characters long"),
    office_email: z.string().email("Invalid email address"),
    office_contact: z.string().optional(),
    district_id: z.number({ required_error: "District is required!" }),
    province_id: z.number({ required_error: "Province is required!" }),
    mun_id: z.number().optional(),
    ward_number: z.number().optional(),
});

export type CreateOfficeDTO = z.infer<typeof CreateOfficeSchema>;
