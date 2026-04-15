import { createAction } from "@reduxjs/toolkit";
import { ConsumptionLogRef } from "@/models/types";
import { createActionWithMeta } from "../actionExtensions";
import { CreateConsumptionLogRequest } from "./messages";

export const fetchConsumptionLogs = createAction<void>("consumptionLogs/fetch");
export const createConsumptionLog = createActionWithMeta<CreateConsumptionLogRequest, ConsumptionLogRef>("consumptionLogs/saveConsumptionLog");
export const deleteConsumptionLog = createActionWithMeta<ConsumptionLogRef>("consumptionLogs/deleteConsumptionLog");
