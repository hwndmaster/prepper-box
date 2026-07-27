import { z } from "zod";

export const storageLocationSchema = z.object({
    name: z.string().min(1, "Name is required"),
});

export type StorageLocationSchemaData = z.infer<typeof storageLocationSchema>;
