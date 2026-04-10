import { z } from "zod";
import { StorageLocationRef } from "@/models/types";
import { requiredRef } from "@/shared/validation/referenceSchema";

export const trackedProductFormSchema = z.object({
    quantity: z.number({ message: "Quantity is required" }).int().min(1, "Quantity must be at least 1"),
    storageLocationId: requiredRef<StorageLocationRef>("Storage location is required"),
    expirationDate: z.string().optional(),
    notes: z.string().optional(),
});

export type TrackedProductFormData = z.infer<typeof trackedProductFormSchema>;
