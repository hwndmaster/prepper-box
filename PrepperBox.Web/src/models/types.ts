import { EntityIntId, createIntRefConverter  } from "@hwndmaster/atom-web-core";


export type CategoryRef = EntityIntId<"Category">;
export type ConsumptionLogRef = EntityIntId<"ConsumptionLog">;
export type ProductRef = EntityIntId<"Product">;
export type StorageLocationRef = EntityIntId<"StorageLocation">;
export type TrackedProductRef = EntityIntId<"TrackedProduct">;

export const categoryRef = createIntRefConverter<CategoryRef>();
export const consumptionLogRef = createIntRefConverter<ConsumptionLogRef>();
export const productRef = createIntRefConverter<ProductRef>();
export const storageLocationRef = createIntRefConverter<StorageLocationRef>();
export const trackedProductRef = createIntRefConverter<TrackedProductRef>();
