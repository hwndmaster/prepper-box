import type { TrackedProductSchemaData } from "@/schemas/trackedProductSchema";
import { normalizeApiFieldName } from "./helpers";

type TrackedProductValidationFieldName = Extract<keyof TrackedProductSchemaData, string>;

const trackedProductValidationFieldMap: Partial<Record<string, TrackedProductValidationFieldName>> = {
    Quantity: "quantity",
    StorageLocationId: "storageLocationId",
    ExpirationDate: "expirationDate",
    Notes: "notes",
};

/**
 * Maps backend validation field names to tracked product form field names.
 */
export function mapTrackedProductValidationField(apiFieldName: string): TrackedProductValidationFieldName | undefined {
    return trackedProductValidationFieldMap[normalizeApiFieldName(apiFieldName)];
}
