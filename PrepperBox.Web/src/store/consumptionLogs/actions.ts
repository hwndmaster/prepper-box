import { createAction } from "@reduxjs/toolkit";
import { CreateConsumptionLogRequest } from "@/api/api.generated";
import { ConsumptionLogRef } from "@/models/types";
import { createActionWithMeta } from "../actionExtensions";

export const fetchConsumptionLogs = createAction<void>("consumptionLogs/fetch");
export const createConsumptionLog = createActionWithMeta<CreateConsumptionLogRequest, ConsumptionLogRef>("consumptionLogs/saveConsumptionLog");
export const deleteConsumptionLog = createActionWithMeta<ConsumptionLogRef>("consumptionLogs/deleteConsumptionLog");
