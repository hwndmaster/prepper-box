import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { dateToTicks } from "@hwndmaster/atom-web-core";
import { PrimeReactProvider } from "@/primereact";
import { setupStore, type AppState } from "@/store";
import { categoryRef, productFamilyRef, productRef, storageLocationRef } from "@/models/types";
import { createCategory, createProduct, createProductFamily, createStorageLocation, createTrackedProduct } from "@/utils/tests/testModels";
import Home from "./home";

const FoodCategoryId = categoryRef(1);
const CannedFishId = productFamilyRef(1);
const PastaId = productFamilyRef(2);

function renderHome(preloaded: Partial<AppState>): ReturnType<typeof render> {
    const { store } = setupStore(preloaded, true);
    return render(
        <Provider store={store}>
            <PrimeReactProvider>
                <MemoryRouter>
                    <Home />
                </MemoryRouter>
            </PrimeReactProvider>
        </Provider>
    );
}

function ticksOn(isoDate: string): number {
    return dateToTicks(new Date(`${isoDate}T00:00`));
}

/** Canned fish comes first in family order, while Pasta holds the soonest-expiring product. */
function stockState(): Partial<AppState> {
    return {
        categories: { categories: [createCategory({ id: FoodCategoryId })] },
        productFamilies: {
            productFamilies: [
                createProductFamily({ id: CannedFishId, categoryId: FoodCategoryId, name: "Canned fish" }),
                createProductFamily({ id: PastaId, categoryId: FoodCategoryId, name: "Pasta" }),
            ],
        },
        products: {
            products: [
                createProduct({ id: productRef(1), name: "Tuna", familyId: CannedFishId, categoryId: FoodCategoryId }),
                createProduct({ id: productRef(2), name: "Penne", familyId: PastaId, categoryId: FoodCategoryId }),
                createProduct({ id: productRef(3), name: "Spaghetti", familyId: PastaId, categoryId: FoodCategoryId }),
            ],
        },
        trackedProducts: {
            trackedProducts: [
                createTrackedProduct({ productId: productRef(1), expirationDate: ticksOn("2032-05-01") }),
                createTrackedProduct({ productId: productRef(2) }),
                createTrackedProduct({ productId: productRef(3), expirationDate: ticksOn("2031-11-20") }),
                createTrackedProduct({ productId: productRef(3), expirationDate: ticksOn("2031-10-05") }),
            ],
        },
    };
}

function productNames(container: HTMLElement): (string | null)[] {
    return Array.from(container.querySelectorAll("[data-test_id='Home__Product_Name']"), (name) => name.textContent);
}

describe("Home page", () => {
    it("Home page: shows each product's soonest expiration next to its name, and none for undated stock", () => {
        // Arrange / Act
        const { container } = renderHome(stockState());

        // Assert - rows are Tuna, Penne, Spaghetti; Penne holds only undated stock
        const expirations = Array.from(
            container.querySelectorAll("[data-test_id='Home__Product_Expiration']"),
            (expiration) => expiration.textContent
        );
        expect(expirations).toEqual(["exp. 01-May-2032", "exp. 05-Oct-2031"]);
    });

    it("Home page: the expiring-first switch moves the soonest-expiring family to the top, keeping families grouped", () => {
        // Arrange
        const { container } = renderHome(stockState());
        const sortSwitch = container.querySelector("[data-test_id='Home__Sort_By_Expiration_Switch'] input") as Element;
        expect(productNames(container)).toEqual(["Tuna", "Penne", "Spaghetti"]);

        // Act
        fireEvent.click(sortSwitch);

        // Assert
        expect(productNames(container)).toEqual(["Spaghetti", "Penne", "Tuna"]);
        expect(container.querySelectorAll("[data-test_id='Home__Family_Header']")).toHaveLength(2);

        // Act
        fireEvent.click(sortSwitch);

        // Assert
        expect(productNames(container)).toEqual(["Tuna", "Penne", "Spaghetti"]);
    });

    it("Home page: the change-storage action of a tracked product opens the dialog on its current storage", async () => {
        // Arrange - a single product stored in the attic
        const attic = createStorageLocation({ id: storageLocationRef(2), name: "Attic" });
        const { container } = renderHome({
            categories: { categories: [createCategory({ id: FoodCategoryId })] },
            productFamilies: { productFamilies: [createProductFamily({ id: CannedFishId, categoryId: FoodCategoryId })] },
            products: { products: [createProduct({ id: productRef(1), name: "Tuna", familyId: CannedFishId, categoryId: FoodCategoryId })] },
            storageLocations: { storageLocations: [createStorageLocation({ id: storageLocationRef(1), name: "Basement" }), attic] },
            trackedProducts: { trackedProducts: [createTrackedProduct({ productId: productRef(1), storageLocationId: attic.id })] },
        });
        fireEvent.click(container.querySelector("[data-test_id='Home__Product_Name']") as Element);

        // Act
        fireEvent.click(container.querySelector("[data-test_id='Home__Change_Storage_TrackedProduct']") as Element);

        // Assert - the dialog renders into a portal on document.body and picks up the storage once shown
        const dialog = document.body.querySelector("[data-test_id='ChangeStorageDialog__Dialog']");
        expect(dialog).not.toBeNull();
        await waitFor(() => {
            expect(dialog?.querySelector("[data-test_id='ChangeStorageDialog__Storage'] .p-dropdown-label")?.textContent).toBe("Attic");
        });
    });
});
