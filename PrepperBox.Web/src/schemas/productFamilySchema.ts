import { z } from "zod";
import { UnitOfMeasure } from "@/models/unitOfMeasure";

export const productFamilySchema = z.object({
    name: z.string().min(1, "Name is required"),
    unitOfMeasure: z.enum(UnitOfMeasure),
    minimumStockLevel: z.number().min(0, "Minimum stock level cannot be negative"),
});

export type ProductFamilySchemaData = z.infer<typeof productFamilySchema>;
