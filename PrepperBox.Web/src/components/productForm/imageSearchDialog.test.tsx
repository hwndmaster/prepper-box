import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { Provider } from "react-redux";
import { PrimeReactProvider } from "@/primereact";
import * as store from "@/store";
import ImageSearchResult from "@/models/imageSearchResult";
import { fakeStore } from "@/utils/tests/fakeStore";
import ImageSearchDialog from "./imageSearchDialog";

const BakedBeans: ImageSearchResult = {
    imageUrl: "https://shop.example.org/beans.jpg",
    thumbnailUrl: "https://serpapi.example.org/thumbs/1.jpeg",
    title: "Heinz Baked Beans 415g",
    sourceName: "Example Shop",
    width: 1200,
    height: 900,
};

/** Answers every image search with the given images, recording the queries searched for. */
function setupSearchResults(images: ImageSearchResult[]): string[] {
    const queries: string[] = [];
    fakeStore.setupAction(store.ImageSearch.Actions.searchImages, (action) => {
        queries.push(action.payload);
        action.meta.resolve?.(images);
    });
    return queries;
}

function renderDialog(onSelect: (image: ImageSearchResult) => void = vi.fn()): void {
    render(
        <Provider store={fakeStore.store}>
            <PrimeReactProvider>
                <ImageSearchDialog visible initialQuery="Heinz Baked Beans" onSelect={onSelect} onHide={vi.fn()} />
            </PrimeReactProvider>
        </Provider>
    );
}

// The dialog renders into a portal on document.body, outside the render container.
function byTestId(testId: string): HTMLElement | null {
    return document.body.querySelector(`[data-test_id='${testId}']`);
}

describe("ImageSearchDialog", () => {
    beforeEach(() => {
        fakeStore.reset();
    });

    it("ImageSearchDialog: searches for the prefilled query and shows the images found with their source and size", () => {
        // Arrange
        const queries = setupSearchResults([BakedBeans]);
        renderDialog();
        expect((byTestId("ImageSearchDialog__Query") as HTMLInputElement).value).toBe("Heinz Baked Beans");

        // Act
        fireEvent.click(byTestId("ImageSearchDialog__Search") as Element);

        // Assert
        expect(queries).toEqual(["Heinz Baked Beans"]);
        const images = document.body.querySelectorAll("[data-test_id='ImageSearchDialog__Image']");
        expect(images).toHaveLength(1);
        expect(images[0].querySelector("img")?.getAttribute("src")).toBe(BakedBeans.thumbnailUrl);
        expect(images[0].textContent).toBe("Example Shop · 1200×900");
    });

    it("ImageSearchDialog: clicking an image selects it", () => {
        // Arrange
        setupSearchResults([BakedBeans]);
        const onSelect = vi.fn<(image: ImageSearchResult) => void>();
        renderDialog(onSelect);
        fireEvent.click(byTestId("ImageSearchDialog__Search") as Element);

        // Act
        fireEvent.click(byTestId("ImageSearchDialog__Image") as Element);

        // Assert
        expect(onSelect).toHaveBeenCalledWith(BakedBeans);
    });

    it("ImageSearchDialog: says so when the search finds nothing", () => {
        // Arrange
        setupSearchResults([]);
        renderDialog();

        // Act
        fireEvent.click(byTestId("ImageSearchDialog__Search") as Element);

        // Assert
        expect(byTestId("ImageSearchDialog__No_Results")).not.toBeNull();
        expect(byTestId("ImageSearchDialog__Image")).toBeNull();
    });

    it("ImageSearchDialog: does not search for a blank query", () => {
        // Arrange
        const queries = setupSearchResults([BakedBeans]);
        renderDialog();
        const queryInput = byTestId("ImageSearchDialog__Query") as Element;

        // Act
        fireEvent.change(queryInput, { target: { value: "   " } });
        fireEvent.keyDown(queryInput, { key: "Enter" });

        // Assert
        expect(byTestId("ImageSearchDialog__Search")?.hasAttribute("disabled")).toBe(true);
        expect(queries).toEqual([]);
    });
});
