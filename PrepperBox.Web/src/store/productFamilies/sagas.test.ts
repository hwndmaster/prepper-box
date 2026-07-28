import { Common } from "@hwndmaster/atom-react-redux";
import { SagaRunner } from "@hwndmaster/atom-testing-utils";
import { vi } from "vitest";
import * as api from "@/api/api.generated";
import ProductFamily from "@/models/productFamily";
import { categoryRef, ProductFamilyRef, productFamilyRef } from "@/models/types";
import { UnitOfMeasure } from "@/models/unitOfMeasure";
import LoadingTargets from "@/shared/loadingTargets";
import AppState from "@/store/appState";
import { fakeAxios } from "@/utils/tests/fakeAxios";
import * as actions from "./actions";
import * as actionsInternal from "./actionsInternal";
import {
    createProductFamilySaga,
    deleteProductFamilySaga,
    fetchProductFamiliesSaga,
    updateProductFamilySaga,
} from "./sagas";

const sagaRunner = new SagaRunner<AppState>();

const createProductFamily = (overrides: Partial<ProductFamily> = {}): ProductFamily => ({
    id: productFamilyRef(1),
    categoryId: categoryRef(2),
    name: "Beans",
    unitOfMeasure: UnitOfMeasure.Can,
    minimumStockLevel: 6,
    productsCount: 3,
    lastModified: 10,
    dateCreated: 1000,
    ...overrides,
});

describe("productFamilies sagas", () => {
    beforeEach(() => {
        fakeAxios.reset();
        sagaRunner.reset();
        sagaRunner.setInitialState({ productFamilies: { productFamilies: [] } });
        vi.clearAllMocks();
    });

    it("fetchProductFamiliesSaga: fetches product families and stores them", async () => {
        // Arrange
        const familyDto: api.ProductFamilyDto = {
            id: productFamilyRef(1),
            categoryId: categoryRef(2),
            name: "Beans",
            unitOfMeasure: UnitOfMeasure.Can,
            minimumStockLevel: 6,
            productsCount: 3,
            lastModified: 10,
            dateCreated: 1000,
        };
        fakeAxios.setupGet(api.ProductFamiliesClient, "productFamiliesAll")
            .reply(200, [familyDto]);

        // Act
        await sagaRunner.runSaga(fetchProductFamiliesSaga);

        // Assert
        expect(sagaRunner.dispatched).toContainEqual({ type: Common.Actions.showLoader.type, payload: LoadingTargets.ProductFamilies });
        expect(sagaRunner.findDispatchedAction(actionsInternal.setProductFamilies)).toEqual([createProductFamily()]);
        expect(sagaRunner.dispatched).toContainEqual({ type: Common.Actions.hideLoader.type, payload: LoadingTargets.ProductFamilies });
    });

    it("createProductFamilySaga: creates a family with an empty products count", async () => {
        // Arrange
        const createRequest: api.CreateProductFamilyRequest = {
            categoryId: categoryRef(2),
            name: "Rice",
            unitOfMeasure: UnitOfMeasure.Kilogram,
            minimumStockLevel: 4,
        };
        fakeAxios.setupPost(api.ProductFamiliesClient, "productFamiliesPOST", { body: createRequest })
            .reply(200, { entityId: productFamilyRef(9), lastModified: 55 });
        const resolve = vi.fn<(value?: ProductFamilyRef) => void>();
        const action = actions.createProductFamily(createRequest, undefined, resolve);

        // Act
        await sagaRunner.runSaga(createProductFamilySaga, action);

        // Assert
        expect(sagaRunner.findDispatchedAction(actionsInternal.setProductFamily)).toEqual({
            ...createRequest,
            id: productFamilyRef(9),
            lastModified: 55,
            productsCount: 0,
            dateCreated: expect.any(Number),
        });
        expect(resolve).toHaveBeenCalledWith(productFamilyRef(9));
    });

    it("createProductFamilySaga: rejects when the API returns no result", async () => {
        // Arrange
        fakeAxios.setupPost(api.ProductFamiliesClient, "productFamiliesPOST")
            .reply(200, null);
        const reject = vi.fn<(reason?: string) => void>();
        const action = actions.createProductFamily(
            {
                categoryId: categoryRef(2),
                name: "Rice",
                unitOfMeasure: UnitOfMeasure.Kilogram,
                minimumStockLevel: 4,
            },
            undefined,
            undefined,
            reject);

        // Act
        await sagaRunner.runSaga(createProductFamilySaga, action);

        // Assert
        expect(reject).toHaveBeenCalledWith("API did not return created product family.");
        expect(sagaRunner.findDispatchedAction(actionsInternal.setProductFamily)).toBeUndefined();
    });

    it("updateProductFamilySaga: updates an existing family and keeps its products count", async () => {
        // Arrange
        const existing = createProductFamily({ id: productFamilyRef(5), productsCount: 7, lastModified: 3 });
        sagaRunner.setInitialState({ productFamilies: { productFamilies: [existing] } });
        const updateRequest: api.UpdateProductFamilyRequest = {
            id: productFamilyRef(5),
            lastModified: 3,
            categoryId: categoryRef(8),
            name: "Kidney beans",
            unitOfMeasure: UnitOfMeasure.Piece,
            minimumStockLevel: 12,
        };
        fakeAxios.setupPut(api.ProductFamiliesClient, "productFamiliesPUT", { body: updateRequest })
            .reply(200, { entityId: productFamilyRef(5), lastModified: 91 });
        const resolve = vi.fn<(value?: ProductFamilyRef) => void>();
        const action = actions.updateProductFamily(updateRequest, undefined, resolve);

        // Act
        await sagaRunner.runSaga(updateProductFamilySaga, action);

        // Assert
        expect(sagaRunner.findDispatchedAction(actionsInternal.setProductFamily)).toEqual({
            ...existing,
            categoryId: categoryRef(8),
            name: "Kidney beans",
            unitOfMeasure: UnitOfMeasure.Piece,
            minimumStockLevel: 12,
            lastModified: 91,
        });
        expect(resolve).toHaveBeenCalledWith(productFamilyRef(5));
    });

    it("updateProductFamilySaga: rejects when the family is not in the store", async () => {
        // Arrange
        const reject = vi.fn<(reason?: string) => void>();
        const action = actions.updateProductFamily(
            {
                id: productFamilyRef(77),
                lastModified: 1,
                categoryId: categoryRef(2),
                name: "Ghost",
                unitOfMeasure: UnitOfMeasure.Piece,
                minimumStockLevel: 1,
            },
            undefined,
            undefined,
            reject);

        // Act
        await sagaRunner.runSaga(updateProductFamilySaga, action);

        // Assert
        expect(reject).toHaveBeenCalledWith("Cannot update product family with ID 77 because it does not exist in the store.");
        expect(sagaRunner.findDispatchedAction(actionsInternal.setProductFamily)).toBeUndefined();
    });

    it("deleteProductFamilySaga: deletes the family and removes it from the store", async () => {
        // Arrange
        fakeAxios.setupDelete(api.ProductFamiliesClient, "productFamiliesDELETE", { id: productFamilyRef(6) })
            .reply(200);
        const action = actions.deleteProductFamily(productFamilyRef(6));

        // Act
        await sagaRunner.runSaga(deleteProductFamilySaga, action);

        // Assert
        expect(sagaRunner.dispatched).toContainEqual({ type: Common.Actions.showLoader.type, payload: LoadingTargets.ActiveView });
        expect(sagaRunner.findDispatchedAction(actionsInternal.removeProductFamilyFromStore)).toBe(productFamilyRef(6));
        expect(sagaRunner.dispatched).toContainEqual({ type: Common.Actions.hideLoader.type, payload: LoadingTargets.ActiveView });
    });
});
