import { z } from "zod";
import { Months } from "../enums/month.enum";

export const CreateAnimalSchema = z.object({
    age_months: z.nativeEnum(Months),
    age_years: z.number(),
    animal_category: z.number(),
    animal_type: z.number(),
    tag_number: z.string(),
    is_vaccination_applied: z.string(),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
    owners_contact: z.string().length(10, 'Must be 10 characters long'),
    production_capacity: z.string(),
});

export type CreateAnimalDTO = z.infer<typeof CreateAnimalSchema>;
