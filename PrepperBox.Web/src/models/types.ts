import { EntityId } from "@/shared/entityId";

// Generic factory function to create ref converters with empty() method
const createRefConverter = <T>(): ((value: number) => T) & { default: () => T } => {
    return Object.assign(
        <TValue extends number>(value: TValue): T => value as unknown as T,
        {
            default: (): T => 0 as unknown as T,
        }
    );
};

export type CategoryRef = EntityId<"Category">;
export type ConsumptionLogRef = EntityId<"ConsumptionLog">;
export type ProductRef = EntityId<"Product">;
export type StorageLocationRef = EntityId<"StorageLocation">;
export type TrackedProductRef = EntityId<"TrackedProduct">;

export const categoryRef = createRefConverter<CategoryRef>();
export const consumptionLogRef = createRefConverter<ConsumptionLogRef>();
export const productRef = createRefConverter<ProductRef>();
export const storageLocationRef = createRefConverter<StorageLocationRef>();
export const trackedProductRef = createRefConverter<TrackedProductRef>();
