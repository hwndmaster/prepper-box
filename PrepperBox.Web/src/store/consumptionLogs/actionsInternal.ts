import { createAction } from "@reduxjs/toolkit";
import { ConsumptionLogRef } from "@/models/types";
import ConsumptionLog from "@/models/consumptionLog";

export const setConsumptionLog = createAction<ConsumptionLog>("consumptionLogs/setConsumptionLog");
export const setConsumptionLogs = createAction<ConsumptionLog[]>("consumptionLogs/setConsumptionLogs");
export const removeConsumptionLogFromStore = createAction<ConsumptionLogRef>("consumptionLogs/removeConsumptionLog");
