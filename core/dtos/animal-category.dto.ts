import { z } from "zod";

export const CreateAnimalCategorySchema = z.object({
    category_name: z.string().min(3, "Name must be at least 3 characters long"),
});

export type CreateAnimalCategoryDTO = z.infer<typeof CreateAnimalCategorySchema>;
