import { z } from "zod";
import { requiredIntRef } from "@hwndmaster/atom-react-core";
import { StorageLocationRef } from "@/models/types";

export const trackedProductFormSchema = z.object({
    quantity: z.number({ message: "Quantity is required" }).min(0.1, "Quantity must be at least 0.1"),
    storageLocationId: requiredIntRef<StorageLocationRef>("Storage location is required"),
    expirationDate: z.string().optional(),
    notes: z.string().optional(),
});

export type TrackedProductFormData = z.infer<typeof trackedProductFormSchema>;
