import { Common } from "@hwndmaster/atom-react-redux";
import { SagaRunner } from "@hwndmaster/atom-testing-utils";
import { vi } from "vitest";
import * as api from "@/api/api.generated";
import ConsumptionLog from "@/models/consumptionLog";
import { ConsumptionLogRef, consumptionLogRef, productRef } from "@/models/types";
import LoadingTargets from "@/shared/loadingTargets";
import AppState from "@/store/appState";
import { fakeAxios } from "@/utils/tests/fakeAxios";
import * as actions from "./actions";
import * as actionsInternal from "./actionsInternal";
import { createConsumptionLogSaga, deleteConsumptionLogSaga, fetchConsumptionLogsSaga } from "./sagas";

const sagaRunner = new SagaRunner<AppState>();

const createConsumptionLog = (overrides: Partial<ConsumptionLog> = {}): ConsumptionLog => ({
    id: consumptionLogRef(1),
    productId: productRef(2),
    quantity: 3,
    reason: "Eaten",
    lastModified: 10,
    dateCreated: 1000,
    ...overrides,
});

describe("consumptionLogs sagas", () => {
    beforeEach(() => {
        fakeAxios.reset();
        sagaRunner.reset();
        sagaRunner.setInitialState({ consumptionLogs: { consumptionLogs: [] } });
        vi.clearAllMocks();
    });

    it("fetchConsumptionLogsSaga: fetches consumption logs and stores them", async () => {
        // Arrange
        const logDto: api.ConsumptionLogDto = {
            id: consumptionLogRef(1),
            productId: productRef(2),
            quantity: 3,
            reason: "Eaten",
            lastModified: 10,
            dateCreated: 1000,
        };
        fakeAxios.setupGet(api.ConsumptionLogsClient, "consumptionLogsAll")
            .reply(200, [logDto]);

        // Act
        await sagaRunner.runSaga(fetchConsumptionLogsSaga);

        // Assert
        expect(sagaRunner.dispatched).toContainEqual({ type: Common.Actions.showLoader.type, payload: LoadingTargets.ConsumptionLogs });
        expect(sagaRunner.findDispatchedAction(actionsInternal.setConsumptionLogs)).toEqual([createConsumptionLog()]);
        expect(sagaRunner.dispatched).toContainEqual({ type: Common.Actions.hideLoader.type, payload: LoadingTargets.ConsumptionLogs });
    });

    it("createConsumptionLogSaga: creates a consumption log and stores it", async () => {
        // Arrange
        const createRequest: api.CreateConsumptionLogRequest = {
            productId: productRef(2),
            quantity: 5,
            reason: "Cooked dinner",
        };
        fakeAxios.setupPost(api.ConsumptionLogsClient, "consumptionLogsPOST", { body: createRequest })
            .reply(200, { entityId: consumptionLogRef(40), lastModified: 80 });
        const resolve = vi.fn<(value?: ConsumptionLogRef) => void>();
        const action = actions.createConsumptionLog(createRequest, resolve);

        // Act
        await sagaRunner.runSaga(createConsumptionLogSaga, action);

        // Assert
        expect(sagaRunner.dispatched).toContainEqual({ type: Common.Actions.showLoader.type, payload: LoadingTargets.ActiveView });
        expect(sagaRunner.findDispatchedAction(actionsInternal.setConsumptionLog)).toEqual({
            ...createRequest,
            id: consumptionLogRef(40),
            lastModified: 80,
            dateCreated: expect.any(Number),
        });
        expect(resolve).toHaveBeenCalledWith(consumptionLogRef(40));
        expect(sagaRunner.dispatched).toContainEqual({ type: Common.Actions.hideLoader.type, payload: LoadingTargets.ActiveView });
    });

    it("createConsumptionLogSaga: rejects when the API returns no result", async () => {
        // Arrange
        fakeAxios.setupPost(api.ConsumptionLogsClient, "consumptionLogsPOST")
            .reply(200, null);
        const reject = vi.fn<(reason?: string) => void>();
        const action = actions.createConsumptionLog(
            { productId: productRef(2), quantity: 5, reason: undefined },
            undefined,
            reject);

        // Act
        await sagaRunner.runSaga(createConsumptionLogSaga, action);

        // Assert
        expect(reject).toHaveBeenCalledWith("API did not return created consumption log.");
        expect(sagaRunner.findDispatchedAction(actionsInternal.setConsumptionLog)).toBeUndefined();
    });

    it("deleteConsumptionLogSaga: deletes the consumption log and removes it from the store", async () => {
        // Arrange
        fakeAxios.setupDelete(api.ConsumptionLogsClient, "consumptionLogsDELETE", { id: consumptionLogRef(13) })
            .reply(200);
        const action = actions.deleteConsumptionLog(consumptionLogRef(13));

        // Act
        await sagaRunner.runSaga(deleteConsumptionLogSaga, action);

        // Assert
        expect(sagaRunner.dispatched).toContainEqual({ type: Common.Actions.showLoader.type, payload: LoadingTargets.ActiveView });
        expect(sagaRunner.findDispatchedAction(actionsInternal.removeConsumptionLogFromStore)).toBe(consumptionLogRef(13));
        expect(sagaRunner.dispatched).toContainEqual({ type: Common.Actions.hideLoader.type, payload: LoadingTargets.ActiveView });
    });
});
