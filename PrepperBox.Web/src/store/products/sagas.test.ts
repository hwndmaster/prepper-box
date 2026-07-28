import { Common } from "@hwndmaster/atom-react-redux";
import { SagaRunner } from "@hwndmaster/atom-testing-utils";
import { vi } from "vitest";
import * as api from "@/api/api.generated";
import Product from "@/models/product";
import ProductFamily from "@/models/productFamily";
import { categoryRef, ProductRef, productFamilyRef, productRef } from "@/models/types";
import { UnitOfMeasure } from "@/models/unitOfMeasure";
import LoadingTargets from "@/shared/loadingTargets";
import AppState from "@/store/appState";
import { fakeAxios } from "@/utils/tests/fakeAxios";
import * as actions from "./actions";
import * as actionsInternal from "./actionsInternal";
import {
    createProductSaga,
    deleteProductSaga,
    fetchProductsByBarCodeSaga,
    fetchProductsSaga,
    updateProductSaga,
} from "./sagas";

const sagaRunner = new SagaRunner<AppState>();

const createProduct = (overrides: Partial<Product> = {}): Product => ({
    id: productRef(1),
    name: "Baked beans 400g",
    description: "Tomato sauce",
    familyId: productFamilyRef(2),
    categoryId: categoryRef(3),
    manufacturer: "Heinz",
    barCode: "5000157024671",
    imageUrl: "https://example.org/large.jpg",
    imageSmallUrl: "https://example.org/small.jpg",
    trackedProductsCount: 4,
    lastModified: 10,
    dateCreated: 1000,
    ...overrides,
});

const createFamily = (overrides: Partial<ProductFamily> = {}): ProductFamily => ({
    id: productFamilyRef(2),
    categoryId: categoryRef(3),
    name: "Beans",
    unitOfMeasure: UnitOfMeasure.Can,
    minimumStockLevel: 6,
    productsCount: 1,
    lastModified: 10,
    dateCreated: 1000,
    ...overrides,
});

const productDto: api.ProductDto = {
    id: productRef(1),
    name: "Baked beans 400g",
    description: "Tomato sauce",
    familyId: productFamilyRef(2),
    categoryId: categoryRef(3),
    manufacturer: "Heinz",
    barCode: "5000157024671",
    imageUrl: "https://example.org/large.jpg",
    imageSmallUrl: "https://example.org/small.jpg",
    trackedProductsCount: 4,
    lastModified: 10,
    dateCreated: 1000,
};

describe("products sagas", () => {
    beforeEach(() => {
        fakeAxios.reset();
        sagaRunner.reset();
        sagaRunner.setInitialState({
            products: { products: [] },
            productFamilies: { productFamilies: [] },
        });
        vi.clearAllMocks();
    });

    it("fetchProductsSaga: fetches products and stores them", async () => {
        // Arrange
        fakeAxios.setupGet(api.ProductsClient, "productsAll")
            .reply(200, [productDto]);

        // Act
        await sagaRunner.runSaga(fetchProductsSaga);

        // Assert
        expect(sagaRunner.dispatched).toContainEqual({ type: Common.Actions.showLoader.type, payload: LoadingTargets.Products });
        expect(sagaRunner.findDispatchedAction(actionsInternal.setProducts)).toEqual([createProduct()]);
        expect(sagaRunner.dispatched).toContainEqual({ type: Common.Actions.hideLoader.type, payload: LoadingTargets.Products });
    });

    it("createProductSaga: creates a product and derives the category from its family", async () => {
        // Arrange
        sagaRunner.setInitialState({
            products: { products: [] },
            productFamilies: { productFamilies: [createFamily({ id: productFamilyRef(2), categoryId: categoryRef(30) })] },
        });
        const createRequest: api.CreateProductRequest = {
            name: "Chickpeas 400g",
            description: undefined,
            familyId: productFamilyRef(2),
            manufacturer: "Bonduelle",
            barCode: "123456",
            imageUrl: undefined,
            imageSmallUrl: undefined,
        };
        fakeAxios.setupPost(api.ProductsClient, "productsPOST", { body: createRequest })
            .reply(200, { entityId: productRef(20), lastModified: 60 });
        const resolve = vi.fn<(value?: ProductRef) => void>();
        const action = actions.createProduct(createRequest, undefined, resolve);

        // Act
        await sagaRunner.runSaga(createProductSaga, action);

        // Assert
        expect(sagaRunner.findDispatchedAction(actionsInternal.setProduct)).toEqual({
            ...createRequest,
            id: productRef(20),
            categoryId: categoryRef(30),
            trackedProductsCount: 0,
            lastModified: 60,
            dateCreated: expect.any(Number),
        });
        expect(resolve).toHaveBeenCalledWith(productRef(20));
    });

    it("createProductSaga: falls back to the default category when the family is unknown", async () => {
        // Arrange
        fakeAxios.setupPost(api.ProductsClient, "productsPOST")
            .reply(200, { entityId: productRef(21), lastModified: 61 });
        const action = actions.createProduct({
            name: "Chickpeas 400g",
            description: undefined,
            familyId: productFamilyRef(999),
            manufacturer: undefined,
            barCode: undefined,
            imageUrl: undefined,
            imageSmallUrl: undefined,
        });

        // Act
        await sagaRunner.runSaga(createProductSaga, action);

        // Assert
        expect(sagaRunner.findDispatchedAction(actionsInternal.setProduct)?.categoryId).toBe(categoryRef.default());
    });

    it("createProductSaga: rejects when the API returns no result", async () => {
        // Arrange
        fakeAxios.setupPost(api.ProductsClient, "productsPOST")
            .reply(200, null);
        const reject = vi.fn<(reason?: string) => void>();
        const action = actions.createProduct(
            {
                name: "Chickpeas 400g",
                description: undefined,
                familyId: productFamilyRef(2),
                manufacturer: undefined,
                barCode: undefined,
                imageUrl: undefined,
                imageSmallUrl: undefined,
            },
            undefined,
            undefined,
            reject);

        // Act
        await sagaRunner.runSaga(createProductSaga, action);

        // Assert
        expect(reject).toHaveBeenCalledWith("API did not return created product.");
        expect(sagaRunner.findDispatchedAction(actionsInternal.setProduct)).toBeUndefined();
    });

    it("updateProductSaga: updates the product and re-derives the category from the new family", async () => {
        // Arrange
        const existing = createProduct({ id: productRef(5), categoryId: categoryRef(3), lastModified: 2 });
        sagaRunner.setInitialState({
            products: { products: [existing] },
            productFamilies: { productFamilies: [createFamily({ id: productFamilyRef(40), categoryId: categoryRef(41) })] },
        });
        const updateRequest: api.UpdateProductRequest = {
            id: productRef(5),
            lastModified: 2,
            name: "Baked beans 800g",
            description: "Bigger can",
            familyId: productFamilyRef(40),
            manufacturer: "Heinz",
            barCode: "5000157024671",
            imageUrl: undefined,
            imageSmallUrl: undefined,
        };
        fakeAxios.setupPut(api.ProductsClient, "productsPUT", { body: updateRequest })
            .reply(200, { entityId: productRef(5), lastModified: 99 });

        const action = actions.updateProduct(updateRequest);

        // Act
        await sagaRunner.runSaga(updateProductSaga, action);

        // Assert
        expect(sagaRunner.findDispatchedAction(actionsInternal.setProduct)).toEqual({
            ...existing,
            ...updateRequest,
            categoryId: categoryRef(41),
            lastModified: 99,
        });
    });

    it("updateProductSaga: rejects when the product is not in the store", async () => {
        // Arrange
        const reject = vi.fn<(reason?: string) => void>();
        const action = actions.updateProduct(
            {
                id: productRef(404),
                lastModified: 1,
                name: "Ghost",
                description: undefined,
                familyId: productFamilyRef(2),
                manufacturer: undefined,
                barCode: undefined,
                imageUrl: undefined,
                imageSmallUrl: undefined,
            },
            undefined,
            undefined,
            reject);

        // Act
        await sagaRunner.runSaga(updateProductSaga, action);

        // Assert
        expect(reject).toHaveBeenCalledWith("Cannot update product with ID 404 because it does not exist in the store.");
        expect(sagaRunner.findDispatchedAction(actionsInternal.setProduct)).toBeUndefined();
    });

    it("deleteProductSaga: deletes the product and removes it from the store", async () => {
        // Arrange
        fakeAxios.setupDelete(api.ProductsClient, "productsDELETE", { id: productRef(8) })
            .reply(200);
        const action = actions.deleteProduct(productRef(8));

        // Act
        await sagaRunner.runSaga(deleteProductSaga, action);

        // Assert
        expect(sagaRunner.dispatched).toContainEqual({ type: Common.Actions.showLoader.type, payload: LoadingTargets.ActiveView });
        expect(sagaRunner.findDispatchedAction(actionsInternal.removeProductFromStore)).toBe(productRef(8));
        expect(sagaRunner.dispatched).toContainEqual({ type: Common.Actions.hideLoader.type, payload: LoadingTargets.ActiveView });
    });

    it("fetchProductsByBarCodeSaga: resolves with the products matching the bar code", async () => {
        // Arrange
        fakeAxios.setupGet(api.ProductsClient, "byBarcode", { barCode: "5000157024671" })
            .reply(200, [productDto]);
        const resolve = vi.fn<(value?: Product[]) => void>();
        const action = actions.fetchProductsByBarCode("5000157024671", resolve);

        // Act
        await sagaRunner.runSaga(fetchProductsByBarCodeSaga, action);

        // Assert
        expect(resolve).toHaveBeenCalledWith([createProduct()]);
        expect(sagaRunner.findDispatchedAction(actionsInternal.setProducts)).toBeUndefined();
    });

    it("fetchProductsByBarCodeSaga: resolves with an empty list when nothing matches", async () => {
        // Arrange
        fakeAxios.setupGet(api.ProductsClient, "byBarcode", { barCode: "0000000000000" })
            .reply(200, []);
        const resolve = vi.fn<(value?: Product[]) => void>();
        const action = actions.fetchProductsByBarCode("0000000000000", resolve);

        // Act
        await sagaRunner.runSaga(fetchProductsByBarCodeSaga, action);

        // Assert
        expect(resolve).toHaveBeenCalledWith([]);
    });
});
