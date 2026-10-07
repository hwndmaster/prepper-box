import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { PrimeReactProvider } from "@/primereact";
import TrackedProduct from "@/models/trackedProduct";
import { StorageLocationRef, storageLocationRef } from "@/models/types";
import { createStorageLocation, createTrackedProduct } from "@/utils/tests/testModels";
import ChangeStorageDialog from "./changeStorageDialog";

const Basement = createStorageLocation({ id: storageLocationRef(1), name: "Basement" });
const Attic = createStorageLocation({ id: storageLocationRef(2), name: "Attic" });

function renderDialog(trackedProduct: TrackedProduct, onConfirm: (storageLocationId: StorageLocationRef) => void = vi.fn()): void {
    render(
        <PrimeReactProvider>
            <ChangeStorageDialog
                trackedProduct={trackedProduct}
                storageLocations={[Basement, Attic]}
                visible
                onConfirm={onConfirm}
                onCancel={vi.fn()}
            />
        </PrimeReactProvider>
    );
}

// The dialog and the dropdown panel render into portals on document.body, outside the render container.
function byTestId(testId: string): HTMLElement | null {
    return document.body.querySelector(`[data-test_id='${testId}']`);
}

function selectedStorageLabel(): string | null | undefined {
    return byTestId("ChangeStorageDialog__Storage")?.querySelector(".p-dropdown-label")?.textContent;
}

/** The dialog picks up the product's storage once shown, which happens after its enter transition. */
async function waitForShown(expectedLabel: string): Promise<void> {
    await waitFor(() => {
        expect(selectedStorageLabel()).toBe(expectedLabel);
    });
}

function pickStorage(name: string): void {
    fireEvent.click(byTestId("ChangeStorageDialog__Storage") as Element);
    const option = Array.from(document.body.querySelectorAll("[data-test_id='ChangeStorageDialog__Storage_Option']"))
        .find((o) => o.textContent === name);
    fireEvent.click(option as Element);
}

describe("ChangeStorageDialog", () => {
    it("ChangeStorageDialog: opens on the product's current storage, with nothing to confirm yet", async () => {
        // Arrange / Act
        renderDialog(createTrackedProduct({ storageLocationId: Basement.id }));

        // Assert
        await waitForShown("Basement");
        expect(byTestId("ChangeStorageDialog__Confirm")?.hasAttribute("disabled")).toBe(true);
    });

    it("ChangeStorageDialog: picking another storage enables the confirmation, which hands over the new storage", async () => {
        // Arrange
        const onConfirm = vi.fn<(storageLocationId: StorageLocationRef) => void>();
        renderDialog(createTrackedProduct({ storageLocationId: Basement.id }), onConfirm);
        await waitForShown("Basement");

        // Act
        pickStorage("Attic");

        // Assert
        expect(selectedStorageLabel()).toBe("Attic");
        expect(byTestId("ChangeStorageDialog__Confirm")?.hasAttribute("disabled")).toBe(false);

        // Act
        fireEvent.click(byTestId("ChangeStorageDialog__Confirm") as Element);

        // Assert
        expect(onConfirm).toHaveBeenCalledWith(Attic.id);
    });

    it("ChangeStorageDialog: clearing the storage moves the product out of any storage", async () => {
        // Arrange
        const onConfirm = vi.fn<(storageLocationId: StorageLocationRef) => void>();
        renderDialog(createTrackedProduct({ storageLocationId: Attic.id }), onConfirm);
        await waitForShown("Attic");

        // Act
        fireEvent.pointerUp(byTestId("ChangeStorageDialog__Storage")?.querySelector(".p-dropdown-clear-icon") as Element);
        fireEvent.click(byTestId("ChangeStorageDialog__Confirm") as Element);

        // Assert
        expect(selectedStorageLabel()).toBe("None");
        expect(onConfirm).toHaveBeenCalledWith(storageLocationRef.default());
    });

    it("ChangeStorageDialog: a product without storage starts on None and can be put into one", async () => {
        // Arrange
        const onConfirm = vi.fn<(storageLocationId: StorageLocationRef) => void>();
        renderDialog(createTrackedProduct(), onConfirm);
        await waitForShown("None");
        expect(byTestId("ChangeStorageDialog__Confirm")?.hasAttribute("disabled")).toBe(true);
        expect(byTestId("ChangeStorageDialog__Storage")?.querySelector(".p-dropdown-clear-icon")).toBeNull();

        // Act
        pickStorage("Basement");
        fireEvent.click(byTestId("ChangeStorageDialog__Confirm") as Element);

        // Assert
        expect(onConfirm).toHaveBeenCalledWith(Basement.id);
    });
});
