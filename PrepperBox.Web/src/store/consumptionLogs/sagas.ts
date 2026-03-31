import { put } from "redux-saga/effects";
import apiClient from "@/api/apiAxios";
import { convertConsumptionLogApiToModel } from "@/api/converters/consumptionLogConverters";
import LoadingTargets from "@/shared/loadingTargets";
import ConsumptionLog from "@/models/consumptionLog";
import * as api from "@/api/api.generated";
import { consumptionLogRef } from "@/models/types";
import { callApi } from "../apiRequest";
import { SagaGenerator } from "../types";
import { withCallback, withLoading } from "../utils";
import * as consumptionLogsActions from "./actions";
import * as consumptionLogsActionsInternal from "./actionsInternal";

/**
 * Core logic for saving a consumption log to the API and updating the store.
 */
function* saveConsumptionLogCore(logToSave: ConsumptionLog): SagaGenerator {
    const isNewLog = logToSave.id === consumptionLogRef.default();

    if (isNewLog) {
        const createRequest: api.CreateConsumptionLogRequest = {
            productId: logToSave.productId,
            quantity: logToSave.quantity,
            reason: logToSave.reason,
        };
        const result = yield* callApi(() => apiClient().consumptionLogs.consumptionLogsPOST(createRequest))
            .invoke();

        if (result == null) {
            throw new Error("API did not return created consumption log.");
        }

        const createdLog: ConsumptionLog = {
            ...logToSave,
            id: result.entityId,
            lastModified: result.lastModified,
        };
        yield put(consumptionLogsActionsInternal.setConsumptionLog(createdLog));

        return result.entityId;
    } else {
        const updateRequest: api.UpdateConsumptionLogRequest = {
            id: logToSave.id,
            lastModified: logToSave.lastModified,
            productId: logToSave.productId,
            quantity: logToSave.quantity,
            reason: logToSave.reason,
        };
        const result = yield* callApi(() => apiClient().consumptionLogs.consumptionLogsPUT(updateRequest))
            .invoke();

        if (result == null) {
            throw new Error("API did not return updated consumption log.");
        }

        const updatedLog: ConsumptionLog = {
            ...logToSave,
            lastModified: result.lastModified,
        };
        yield put(consumptionLogsActionsInternal.setConsumptionLog(updatedLog));

        return result.entityId;
    }
}

/**
 * Fetches consumption logs from the API and updates the store.
 */
export function* fetchConsumptionLogsSaga(): Generator<unknown, void, unknown> {
    yield* withLoading(LoadingTargets.ConsumptionLogs, function* () {
        const logs: ConsumptionLog[] = yield* callApi(() => apiClient().consumptionLogs.consumptionLogsAll())
            .fetchArray(convertConsumptionLogApiToModel);
        yield put(consumptionLogsActionsInternal.setConsumptionLogs(logs));
    });
}

/**
 * Saves a consumption log via the API.
 * @param action The action containing the consumption log to save.
 */
export function* saveConsumptionLogSaga(action: ReturnType<typeof consumptionLogsActions.saveConsumptionLog>): SagaGenerator {
    yield* withLoading(LoadingTargets.ActiveView, function* () {
        yield* withCallback(action.meta, function* () {
            return yield* saveConsumptionLogCore(action.payload);
        });
    });
}

/**
 * Deletes a consumption log via the API.
 * @param action The action containing the ID of the consumption log to delete.
 */
export function* deleteConsumptionLogSaga(action: ReturnType<typeof consumptionLogsActions.deleteConsumptionLog>): SagaGenerator {
    yield* withLoading(LoadingTargets.ActiveView, function* () {
        yield* withCallback(action.meta, function* () {
            yield* callApi(() => apiClient().consumptionLogs.consumptionLogsDELETE(action.payload))
                .invoke();
            yield put(consumptionLogsActionsInternal.removeConsumptionLogFromStore(action.payload));
        });
    });
}
