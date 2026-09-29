import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { Provider } from "react-redux";
import { PrimeReactProvider } from "@/primereact";
import { setupStore, type AppState } from "@/store";
import { categoryRef, productFamilyRef } from "@/models/types";
import { createProductFamily } from "@/utils/tests/testModels";
import RestockPanel from "./restockPanel";

const FoodCategoryId = categoryRef(1);

function renderRestockPanel(preloaded: Partial<AppState>): ReturnType<typeof render> {
    const { store } = setupStore(preloaded, true);
    return render(
        <Provider store={store}>
            <PrimeReactProvider>
                <RestockPanel categoryId={FoodCategoryId} onAddProduct={vi.fn()} />
            </PrimeReactProvider>
        </Provider>
    );
}

/** Two families with a minimum and no products at all, so both need restocking. */
function understockedState(): Partial<AppState> {
    return {
        productFamilies: {
            productFamilies: [
                createProductFamily({ id: productFamilyRef(1), categoryId: FoodCategoryId, name: "Canned fish", minimumStockLevel: 6 }),
                createProductFamily({ id: productFamilyRef(2), categoryId: FoodCategoryId, name: "Pasta", minimumStockLevel: 2 }),
            ],
        },
    };
}

describe("RestockPanel", () => {
    it("RestockPanel: starts collapsed to its header, which still shows the family count", () => {
        // Arrange / Act
        const { container } = renderRestockPanel(understockedState());

        // Assert
        const toggle = container.querySelector("[data-test_id='Home__Restock_Toggle']");
        expect(toggle?.textContent).toContain("(2)");
        expect(toggle?.getAttribute("aria-expanded")).toBe("false");
        expect(container.querySelector("[data-test_id='Home__Restock_Family']")).toBeNull();
    });

    it("RestockPanel: clicking the header expands the family list, and clicking it again collapses it", () => {
        // Arrange
        const { container } = renderRestockPanel(understockedState());
        const toggle = container.querySelector("[data-test_id='Home__Restock_Toggle']") as Element;

        // Act
        fireEvent.click(toggle);

        // Assert
        expect(container.querySelectorAll("[data-test_id='Home__Restock_Family']")).toHaveLength(2);
        expect(toggle.getAttribute("aria-expanded")).toBe("true");

        // Act
        fireEvent.click(toggle);

        // Assert
        expect(container.querySelector("[data-test_id='Home__Restock_Family']")).toBeNull();
        expect(toggle.getAttribute("aria-expanded")).toBe("false");
    });

    it("RestockPanel: renders nothing while no family needs restocking", () => {
        // Arrange - a family without a minimum has no target to fall short of
        const preloaded: Partial<AppState> = {
            productFamilies: {
                productFamilies: [createProductFamily({ categoryId: FoodCategoryId, minimumStockLevel: 0 })],
            },
        };

        // Act
        const { container } = renderRestockPanel(preloaded);

        // Assert
        expect(container.querySelector("[data-test_id='Home__Restock_Panel']")).toBeNull();
    });
});
