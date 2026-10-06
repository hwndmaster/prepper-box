import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { PrimeReactProvider } from "@/primereact";
import * as store from "@/store";
import ImageSearchResult from "@/models/imageSearchResult";
import Product from "@/models/product";
import { categoryRef, productFamilyRef } from "@/models/types";
import { createCategory, createProduct, createProductFamily } from "@/utils/tests/testModels";
import { fakeStore } from "@/utils/tests/fakeStore";
import ProductForm, { type ProductFormProps } from "./productForm";

const FoodCategoryId = categoryRef(1);
const CannedFoodId = productFamilyRef(1);

const FoundImage: ImageSearchResult = {
    imageUrl: "https://shop.example.org/beans.jpg",
    thumbnailUrl: "https://serpapi.example.org/thumbs/1.jpeg",
};

/** Baked beans as resolved from OpenFoodFacts, carrying both image sizes. */
function bakedBeans(): Product {
    return createProduct({
        name: "Baked Beans",
        manufacturer: "Heinz",
        categoryId: FoodCategoryId,
        familyId: CannedFoodId,
        imageUrl: "https://images.openfoodfacts.example.org/front.jpg",
        imageSmallUrl: "https://images.openfoodfacts.example.org/front-small.jpg",
    });
}

/** Seeds the lookups the form offers, and answers every image search with the given images. */
function setupStore(foundImages: ImageSearchResult[]): string[] {
    fakeStore.setup({
        categories: { categories: [createCategory({ id: FoodCategoryId })] },
        productFamilies: { productFamilies: [createProductFamily({ id: CannedFoodId, categoryId: FoodCategoryId })] },
    });
    // Loaded on mount; the seeded state already holds what the form needs.
    fakeStore.setupAction(store.Categories.Actions.fetchCategories, () => undefined);
    fakeStore.setupAction(store.ProductFamilies.Actions.fetchProductFamilies, () => undefined);
    fakeStore.setupAction(store.StorageLocations.Actions.fetchStorageLocations, () => undefined);

    const queries: string[] = [];
    fakeStore.setupAction(store.ImageSearch.Actions.searchImages, (action) => {
        queries.push(action.payload);
        action.meta.resolve?.(foundImages);
    });
    return queries;
}

function renderProductForm(product: Product, onSubmit: ProductFormProps["onSubmit"] = vi.fn()): void {
    render(
        <Provider store={fakeStore.store}>
            <PrimeReactProvider>
                <ProductForm product={product} submitLabel="Save Product" onSubmit={onSubmit} onCancel={vi.fn()} />
            </PrimeReactProvider>
        </Provider>
    );
}

// Also covers the image search dialog, which renders into a portal on document.body.
function byTestId(testId: string): HTMLElement | null {
    return document.body.querySelector(`[data-test_id='${testId}']`);
}

describe("ProductForm", () => {
    beforeEach(() => {
        fakeStore.reset();
    });

    it("ProductForm: an image picked from the image search replaces both product images", async () => {
        // Arrange
        const queries = setupStore([FoundImage]);
        const onSubmit = vi.fn<ProductFormProps["onSubmit"]>();
        renderProductForm(bakedBeans(), onSubmit);

        // Act
        fireEvent.click(byTestId("ProductForm__Find_Image") as Element);
        fireEvent.click(byTestId("ImageSearchDialog__Search") as Element);
        fireEvent.click(byTestId("ImageSearchDialog__Image") as Element);

        // Assert - the search box starts from the manufacturer and the name
        expect(queries).toEqual(["Heinz Baked Beans"]);
        expect(byTestId("ProductForm__Product_Image")?.getAttribute("src")).toBe(FoundImage.imageUrl);

        // Act
        fireEvent.click(byTestId("ProductForm__Submit") as Element);

        // Assert - the small OpenFoodFacts image is dropped, or the product list would keep showing it
        await waitFor(() => expect(onSubmit).toHaveBeenCalled());
        const [data] = onSubmit.mock.calls[0];
        expect(data.imageUrl).toBe(FoundImage.imageUrl);
        expect(data.imageSmallUrl).toBeUndefined();
    });

    it("ProductForm: tells when the product image cannot be loaded", () => {
        // Arrange
        setupStore([]);
        renderProductForm(bakedBeans());

        // Act
        fireEvent.error(byTestId("ProductForm__Product_Image") as Element);

        // Assert
        expect(byTestId("ProductForm__Product_Image")).toBeNull();
        expect(byTestId("ProductForm__Product_Image_Unavailable")).not.toBeNull();
        expect(byTestId("ProductForm__Find_Image")).not.toBeNull();
    });
});
