import { z } from "zod";
import { Months } from "../enums/month.enum";

export const CreateAnimalSchema = z.object({
    age_months: z.nativeEnum(Months).optional(),
    age_years: z.number().optional(),
    num_of_animals: z.number().optional(),
    animal_category: z.number().optional(),
    animal_type: z.number().optional(),
    tag_number: z.string().optional(),
    is_vaccination_applied: z.boolean().optional(),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
    owners_contact: z.string().optional(),
    production_capacity: z.number().optional(),
    tag_image: z.string().optional()
}).superRefine((data, ctx) => {
    // Required field validations
    if (data.age_months === undefined) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['age_months'],
            message: 'Age months is required'
        });
    }

    if (data.age_years === undefined) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['age_years'],
            message: 'Age years is required'
        });
    }

    if (data.animal_category === undefined) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['animal_category'],
            message: 'Animal category is required'
        });
    }

    if (data.animal_type === undefined) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['animal_type'],
            message: 'Animal type is required'
        });
    }

    if (data.tag_number === undefined || data.tag_number.trim() === '') {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['tag_number'],
            message: 'Tag number is required'
        });
    }

    if (data.is_vaccination_applied === undefined) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['is_vaccination_applied'],
            message: 'Vaccination status is required'
        });
    }

    if (data.production_capacity === undefined) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['production_capacity'],
            message: 'Production capacity is required'
        });
    }

    // Conditional validation for owners_contact (only validate length if provided)
    if (data.owners_contact !== undefined && data.owners_contact.length !== 10) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['owners_contact'],
            message: 'Contact must be 10 characters long'
        });
    }
});

export type CreateAnimalDTO = z.infer<typeof CreateAnimalSchema>;
export type UpdateAnimalDTO = Partial<CreateAnimalDTO>;
