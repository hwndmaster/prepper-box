import { z } from "zod";
import { requiredIntRef } from "@hwndmaster/atom-react-core";
import { CategoryRef } from "@/models/types";
import { UnitOfMeasure } from "@/models/unitOfMeasure";

export const productFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    categoryId: requiredIntRef<CategoryRef>("Category is required"),
    manufacturer: z.string().optional(),
    barCode: z.string().optional(),
    imageUrl: z.string().optional(),
    imageSmallUrl: z.string().optional(),
    unitOfMeasure: z.enum(UnitOfMeasure),
    minimumStockLevel: z.number().min(0, "Minimum stock level cannot be negative"),
});

export type ProductFormData = z.infer<typeof productFormSchema>;
