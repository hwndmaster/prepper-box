import { z } from "zod";
import { requiredIntRef } from "@hwndmaster/atom-react-core";
import { CategoryRef, ProductFamilyRef } from "@/models/types";

export const productSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    categoryId: requiredIntRef<CategoryRef>("Category is required"),
    familyId: requiredIntRef<ProductFamilyRef>("Family is required"),
    manufacturer: z.string().optional(),
    barCode: z.string().optional(),
    imageUrl: z.string().optional(),
    imageSmallUrl: z.string().optional(),
});

export type ProductSchemaData = z.infer<typeof productSchema>;
