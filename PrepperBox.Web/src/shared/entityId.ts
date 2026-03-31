declare const brand: unique symbol;

type EntityId<T extends string | undefined = undefined> = number & { readonly [brand]: T };

export type { EntityId };
