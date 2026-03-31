import { createReducer } from "@reduxjs/toolkit";
import * as actions from "./actionsInternal";
import ConsumptionLogsState from "./state";

const initialState: ConsumptionLogsState = {
    consumptionLogs: [],
};

const consumptionLogsReducer = createReducer(initialState, (builder) => {
    builder
        .addCase(actions.setConsumptionLogs, (state, action) => {
            state.consumptionLogs = action.payload;
        })
        .addCase(actions.setConsumptionLog, (state, action) => {
            const index = state.consumptionLogs.findIndex((cl) => cl.id === action.payload.id);
            if (index >= 0) {
                state.consumptionLogs[index] = action.payload;
            } else {
                state.consumptionLogs.push(action.payload);
            }
        })
        .addCase(actions.removeConsumptionLogFromStore, (state, action) => {
            state.consumptionLogs = state.consumptionLogs.filter((cl) => cl.id !== action.payload);
        });
});

export default consumptionLogsReducer;
