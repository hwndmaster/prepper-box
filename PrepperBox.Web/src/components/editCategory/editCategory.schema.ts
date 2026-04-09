import { z } from "zod";

export const editCategorySchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    iconName: z.string().min(1, "Icon name is required"),
});

export type EditCategoryFormData = z.infer<typeof editCategorySchema>;
