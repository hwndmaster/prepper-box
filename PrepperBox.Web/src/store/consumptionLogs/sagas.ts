import { put } from "redux-saga/effects";
import { dateToTicks } from "@hwndmaster/atom-web-core";
import { callApi, type SagaGenerator, withCallback, withLoading } from "@hwndmaster/atom-react-redux";
import apiClient from "@/api/apiAxios";
import { convertConsumptionLogApiToModel } from "@/api/converters/consumptionLogConverters";
import LoadingTargets from "@/shared/loadingTargets";
import ConsumptionLog from "@/models/consumptionLog";
import * as consumptionLogsActions from "./actions";
import * as consumptionLogsActionsInternal from "./actionsInternal";

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
 * Creates a consumption log via the API.
 * @param action The action containing the consumption log to create.
 */
export function* createConsumptionLogSaga(action: ReturnType<typeof consumptionLogsActions.createConsumptionLog>): SagaGenerator {
    yield* withLoading(LoadingTargets.ActiveView, function* () {
        yield* withCallback(action.meta, function* () {
            const result = yield* callApi(() =>
                apiClient().consumptionLogs.consumptionLogsPOST(action.payload))
                .invoke();

            if (result == null) {
                throw new Error("API did not return created consumption log.");
            }

            const createdLog: ConsumptionLog = {
                ...action.payload,
                id: result.entityId,
                lastModified: result.lastModified,
                dateCreated: dateToTicks(new Date()),
            };
            yield put(consumptionLogsActionsInternal.setConsumptionLog(createdLog));

            return result.entityId;
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
