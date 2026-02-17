import { z } from "zod";

export const CreateProductionCapacitySchema = z.object({
    capacity_name: z.string().min(1, "Name can't be empty!"),
});

export type CreateProductionCapacityDTO = z.infer<typeof CreateProductionCapacitySchema>;
