import { createAction } from "@reduxjs/toolkit";
import ConsumptionLog from "@/models/consumptionLog";
import { ConsumptionLogRef } from "@/models/types";
import { createActionWithMeta } from "../actionExtensions";

export const fetchConsumptionLogs = createAction<void>("consumptionLogs/fetch");
export const saveConsumptionLog = createActionWithMeta<ConsumptionLog, ConsumptionLogRef>("consumptionLogs/saveConsumptionLog");
export const deleteConsumptionLog = createActionWithMeta<ConsumptionLogRef>("consumptionLogs/deleteConsumptionLog");
