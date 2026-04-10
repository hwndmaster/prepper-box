import { z } from "zod";
import { CategoryRef } from "@/models/types";
import { UnitOfMeasure } from "@/models/unitOfMeasure";
import { requiredRef } from "@/shared/validation/referenceSchema";

export const productFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    categoryId: requiredRef<CategoryRef>("Category is required"),
    manufacturer: z.string().optional(),
    barCode: z.string().optional(),
    unitOfMeasure: z.enum(UnitOfMeasure),
    minimumStockLevel: z.number().min(0, "Minimum stock level cannot be negative"),
});

export type ProductFormData = z.infer<typeof productFormSchema>;
