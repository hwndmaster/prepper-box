import { Common } from "@hwndmaster/atom-react-redux";
import { SagaRunner } from "@hwndmaster/atom-testing-utils";
import { vi } from "vitest";
import * as api from "@/api/api.generated";
import TrackedProduct from "@/models/trackedProduct";
import { productRef, storageLocationRef, TrackedProductRef, trackedProductRef } from "@/models/types";
import LoadingTargets from "@/shared/loadingTargets";
import AppState from "@/store/appState";
import { fakeAxios } from "@/utils/tests/fakeAxios";
import * as actions from "./actions";
import * as actionsInternal from "./actionsInternal";
import {
    createTrackedProductSaga,
    deleteTrackedProductSaga,
    fetchTrackedProductsSaga,
    updateTrackedProductSaga,
    withdrawTrackedProductSaga,
} from "./sagas";

const sagaRunner = new SagaRunner<AppState>();

const createTrackedProduct = (overrides: Partial<TrackedProduct> = {}): TrackedProduct => ({
    id: trackedProductRef(1),
    productId: productRef(2),
    storageLocationId: storageLocationRef(3),
    expirationDate: 5000,
    quantity: 10,
    notes: "Bottom shelf",
    lastModified: 10,
    dateCreated: 1000,
    ...overrides,
});

describe("trackedProducts sagas", () => {
    beforeEach(() => {
        fakeAxios.reset();
        sagaRunner.reset();
        sagaRunner.setInitialState({ trackedProducts: { trackedProducts: [] } });
        vi.clearAllMocks();
    });

    it("fetchTrackedProductsSaga: fetches tracked products and stores them", async () => {
        // Arrange
        const trackedProductDto: api.TrackedProductDto = {
            id: trackedProductRef(1),
            productId: productRef(2),
            storageLocationId: storageLocationRef(3),
            expirationDate: 5000,
            quantity: 10,
            notes: "Bottom shelf",
            lastModified: 10,
            dateCreated: 1000,
        };
        fakeAxios.setupGet(api.TrackedProductsClient, "trackedProductsAll")
            .reply(200, [trackedProductDto]);

        // Act
        await sagaRunner.runSaga(fetchTrackedProductsSaga);

        // Assert
        expect(sagaRunner.dispatched).toContainEqual({ type: Common.Actions.showLoader.type, payload: LoadingTargets.TrackedProducts });
        expect(sagaRunner.findDispatchedAction(actionsInternal.setTrackedProducts)).toEqual([createTrackedProduct()]);
        expect(sagaRunner.dispatched).toContainEqual({ type: Common.Actions.hideLoader.type, payload: LoadingTargets.TrackedProducts });
    });

    it("createTrackedProductSaga: creates a tracked product and stores it", async () => {
        // Arrange
        const createRequest: api.CreateTrackedProductRequest = {
            productId: productRef(2),
            storageLocationId: storageLocationRef(3),
            expirationDate: 7000,
            quantity: 6,
            notes: undefined,
        };
        fakeAxios.setupPost(api.TrackedProductsClient, "trackedProductsPOST", { body: createRequest })
            .reply(200, { entityId: trackedProductRef(30), lastModified: 70 });
        const resolve = vi.fn<(value?: TrackedProductRef) => void>();
        const action = actions.createTrackedProduct(createRequest, undefined, resolve);

        // Act
        await sagaRunner.runSaga(createTrackedProductSaga, action);

        // Assert
        expect(sagaRunner.findDispatchedAction(actionsInternal.setTrackedProduct)).toEqual({
            ...createRequest,
            id: trackedProductRef(30),
            lastModified: 70,
            dateCreated: expect.any(Number),
        });
        expect(resolve).toHaveBeenCalledWith(trackedProductRef(30));
    });

    it("createTrackedProductSaga: rejects when the API returns no result", async () => {
        // Arrange
        fakeAxios.setupPost(api.TrackedProductsClient, "trackedProductsPOST")
            .reply(200, null);
        const reject = vi.fn<(reason?: string) => void>();
        const action = actions.createTrackedProduct(
            {
                productId: productRef(2),
                storageLocationId: storageLocationRef(3),
                expirationDate: undefined,
                quantity: 6,
                notes: undefined,
            },
            undefined,
            undefined,
            reject);

        // Act
        await sagaRunner.runSaga(createTrackedProductSaga, action);

        // Assert
        expect(reject).toHaveBeenCalledWith("API did not return created tracked product.");
        expect(sagaRunner.findDispatchedAction(actionsInternal.setTrackedProduct)).toBeUndefined();
    });

    it("updateTrackedProductSaga: updates an existing tracked product", async () => {
        // Arrange
        const existing = createTrackedProduct({ id: trackedProductRef(9), lastModified: 4 });
        sagaRunner.setInitialState({ trackedProducts: { trackedProducts: [existing] } });
        const updateRequest: api.UpdateTrackedProductRequest = {
            id: trackedProductRef(9),
            lastModified: 4,
            productId: productRef(2),
            storageLocationId: storageLocationRef(15),
            expirationDate: 9000,
            quantity: 3,
            notes: "Moved to the attic",
        };
        fakeAxios.setupPut(api.TrackedProductsClient, "trackedProductsPUT", { body: updateRequest })
            .reply(200, { entityId: trackedProductRef(9), lastModified: 66 });

        const action = actions.updateTrackedProduct(updateRequest);

        // Act
        await sagaRunner.runSaga(updateTrackedProductSaga, action);

        // Assert
        expect(sagaRunner.findDispatchedAction(actionsInternal.setTrackedProduct)).toEqual({
            ...existing,
            ...updateRequest,
            lastModified: 66,
        });
    });

    it("deleteTrackedProductSaga: deletes the tracked product and removes it from the store", async () => {
        // Arrange
        fakeAxios.setupDelete(api.TrackedProductsClient, "trackedProductsDELETE", { id: trackedProductRef(11) })
            .reply(200);
        const action = actions.deleteTrackedProduct(trackedProductRef(11));

        // Act
        await sagaRunner.runSaga(deleteTrackedProductSaga, action);

        // Assert
        expect(sagaRunner.dispatched).toContainEqual({ type: Common.Actions.showLoader.type, payload: LoadingTargets.ActiveView });
        expect(sagaRunner.findDispatchedAction(actionsInternal.removeTrackedProductFromStore)).toBe(trackedProductRef(11));
        expect(sagaRunner.dispatched).toContainEqual({ type: Common.Actions.hideLoader.type, payload: LoadingTargets.ActiveView });
    });

    it("withdrawTrackedProductSaga: logs the consumption and reduces the remaining quantity", async () => {
        // Arrange
        const existing = createTrackedProduct({ id: trackedProductRef(20), quantity: 10, lastModified: 8 });
        sagaRunner.setInitialState({ trackedProducts: { trackedProducts: [existing] } });
        fakeAxios.setupPost(api.ConsumptionLogsClient, "consumptionLogsPOST", {
            body: {
                productId: existing.productId,
                quantity: 4,
                reason: "Withdrawn from stock",
            },
        }).reply(200, { entityId: 500, lastModified: 100 });
        fakeAxios.setupPut(api.TrackedProductsClient, "trackedProductsPUT", {
            body: {
                id: trackedProductRef(20),
                lastModified: 8,
                quantity: 6,
            },
        }).reply(200, { entityId: trackedProductRef(20), lastModified: 111 });

        const action = actions.withdrawTrackedProduct({ trackedProductId: trackedProductRef(20), quantity: 4 });

        // Act
        await sagaRunner.runSaga(withdrawTrackedProductSaga, action);

        // Assert
        expect(sagaRunner.findDispatchedAction(actionsInternal.setTrackedProduct)).toEqual({
            ...existing,
            quantity: 6,
            lastModified: 111,
        });
        expect(sagaRunner.findDispatchedAction(actionsInternal.removeTrackedProductFromStore)).toBeUndefined();
    });

    it("withdrawTrackedProductSaga: deletes the tracked product when the whole stock is withdrawn", async () => {
        // Arrange
        const existing = createTrackedProduct({ id: trackedProductRef(21), quantity: 5 });
        sagaRunner.setInitialState({ trackedProducts: { trackedProducts: [existing] } });
        fakeAxios.setupPost(api.ConsumptionLogsClient, "consumptionLogsPOST")
            .reply(200, { entityId: 501, lastModified: 101 });
        fakeAxios.setupDelete(api.TrackedProductsClient, "trackedProductsDELETE", { id: trackedProductRef(21) })
            .reply(200);

        const action = actions.withdrawTrackedProduct({ trackedProductId: trackedProductRef(21), quantity: 5 });

        // Act
        await sagaRunner.runSaga(withdrawTrackedProductSaga, action);

        // Assert
        expect(sagaRunner.findDispatchedAction(actionsInternal.removeTrackedProductFromStore)).toBe(trackedProductRef(21));
        expect(sagaRunner.findDispatchedAction(actionsInternal.setTrackedProduct)).toBeUndefined();
    });

    it("withdrawTrackedProductSaga: rejects when the tracked product is not in the store", async () => {
        // Arrange
        const reject = vi.fn<(reason?: string) => void>();
        const action = actions.withdrawTrackedProduct(
            { trackedProductId: trackedProductRef(999), quantity: 1 },
            undefined,
            reject);

        // Act
        await sagaRunner.runSaga(withdrawTrackedProductSaga, action);

        // Assert
        expect(reject).toHaveBeenCalledWith("Cannot withdraw from tracked product with ID 999 because it does not exist in the store.");
        expect(sagaRunner.findDispatchedAction(actionsInternal.setTrackedProduct)).toBeUndefined();
    });

    it("withdrawTrackedProductSaga: rejects when the consumption log was not created", async () => {
        // Arrange
        const existing = createTrackedProduct({ id: trackedProductRef(22), quantity: 5 });
        sagaRunner.setInitialState({ trackedProducts: { trackedProducts: [existing] } });
        fakeAxios.setupPost(api.ConsumptionLogsClient, "consumptionLogsPOST")
            .reply(200, null);
        const reject = vi.fn<(reason?: string) => void>();
        const action = actions.withdrawTrackedProduct(
            { trackedProductId: trackedProductRef(22), quantity: 2 },
            undefined,
            reject);

        // Act
        await sagaRunner.runSaga(withdrawTrackedProductSaga, action);

        // Assert
        expect(reject).toHaveBeenCalledWith("API did not return created consumption log.");
        expect(sagaRunner.findDispatchedAction(actionsInternal.setTrackedProduct)).toBeUndefined();
    });
});
