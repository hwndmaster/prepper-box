import { createSelector } from "@reduxjs/toolkit";
import { ConsumptionLogRef } from "@/models/types";
import AppState from "@/store/appState";
import ConsumptionLog from "@/models/consumptionLog";

export const selectConsumptionLogById: (state: AppState, consumptionLogId: ConsumptionLogRef) => ConsumptionLog | undefined = createSelector(
    [(state: AppState, consumptionLogId: ConsumptionLogRef): { consumptionLogs: ConsumptionLog[]; consumptionLogId: ConsumptionLogRef } => ({ consumptionLogs: state.consumptionLogs.consumptionLogs, consumptionLogId })],
    ({ consumptionLogs, consumptionLogId }) => {
        return consumptionLogs.find((cl) => cl.id === consumptionLogId);
    }
);
