import type { StorageLocationSchemaData } from "@/schemas/storageLocationSchema";
import { normalizeApiFieldName } from "./helpers";

type StorageLocationValidationFieldName = Extract<keyof StorageLocationSchemaData, string>;

const storageLocationValidationFieldMap: Partial<Record<string, StorageLocationValidationFieldName>> = {
    Name: "name",
};

/**
 * Maps backend validation field names to storage location form field names.
 */
export function mapStorageLocationValidationField(apiFieldName: string): StorageLocationValidationFieldName | undefined {
    return storageLocationValidationFieldMap[normalizeApiFieldName(apiFieldName)];
}
