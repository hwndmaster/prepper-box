import { z } from "zod";

export const editStorageLocationSchema = z.object({
    name: z.string().min(1, "Name is required"),
});

export type EditStorageLocationFormData = z.infer<typeof editStorageLocationSchema>;
