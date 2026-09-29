import Category from "@/models/category";
import Product from "@/models/product";
import ProductFamily from "@/models/productFamily";
import TrackedProduct from "@/models/trackedProduct";
import { categoryRef, productFamilyRef, productRef, storageLocationRef, trackedProductRef } from "@/models/types";
import { UnitOfMeasure } from "@/models/unitOfMeasure";

let idCounter = 0;

function nextId(): number {
    idCounter += 1;
    return idCounter;
}

/** Creates a Category model with a generated id and override support. */
export function createCategory(overrides?: Partial<Category>): Category {
    return {
        id: categoryRef(nextId()),
        name: "Food",
        description: undefined,
        iconName: "food",
        lastModified: 0,
        dateCreated: 0,
        ...overrides,
    };
}

/** Creates a ProductFamily model with a generated id and override support. */
export function createProductFamily(overrides?: Partial<ProductFamily>): ProductFamily {
    return {
        id: productFamilyRef(nextId()),
        categoryId: categoryRef(1),
        name: "Canned fish",
        unitOfMeasure: UnitOfMeasure.Piece,
        minimumStockLevel: 0,
        productsCount: 0,
        lastModified: 0,
        dateCreated: 0,
        ...overrides,
    };
}

/** Creates a Product model with a generated id and override support. */
export function createProduct(overrides?: Partial<Product>): Product {
    return {
        id: productRef(nextId()),
        name: "Tuna",
        familyId: productFamilyRef(1),
        categoryId: categoryRef(1),
        trackedProductsCount: 0,
        lastModified: 0,
        dateCreated: 0,
        ...overrides,
    };
}

/** Creates a TrackedProduct model with a generated id and override support; undated unless overridden. */
export function createTrackedProduct(overrides?: Partial<TrackedProduct>): TrackedProduct {
    return {
        id: trackedProductRef(nextId()),
        productId: productRef(1),
        storageLocationId: storageLocationRef.default(),
        quantity: 1,
        lastModified: 0,
        dateCreated: 0,
        ...overrides,
    };
}
