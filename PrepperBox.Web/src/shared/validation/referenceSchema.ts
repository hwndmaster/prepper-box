import { z } from "zod";
import { EntityId } from "../entityId";

/**
 * Zod schema for a required reference field of any Guid-based type.
 * Ensures the field is a non-empty string.
 *
 * @example
 * const schema = z.object({
 *     dataSetRef: requiredRef<DataSetRef>(),
 * });
 */
export const requiredRef = <T extends EntityId<string>>(message?: string): z.ZodType<T> =>
    z.number({ message }).int().positive({ message }) as unknown as z.ZodType<T>;

/**
 * Zod schema for an optional reference field of any Guid-based type.
 * Allows empty strings or undefined values.
 *
 * @example
 * const schema = z.object({
 *     dataSetRef: optionalRef<DataSetRef>(),
 * });
 */
export const optionalRef = <T extends EntityId<string>>(): z.ZodType<T | undefined> =>
    z.number().int().positive().optional() as unknown as z.ZodType<T | undefined>;
