import { z } from "zod";

export const CreateAnimaTypeSchema = z.object({
    animal_name: z.string().min(1, "Type can't be empty!"),
});

export type CreateAnimaTypeDTO = z.infer<typeof CreateAnimaTypeSchema>;
