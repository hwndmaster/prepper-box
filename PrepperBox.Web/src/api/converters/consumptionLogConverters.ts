import * as api from "@/api/api.generated";
import ConsumptionLog from "@/models/consumptionLog";

/**
 * Converts an API ConsumptionLogDto to a ConsumptionLog model.
 * @param apiLog The ConsumptionLogDto from the API.
 * @returns The converted ConsumptionLog model.
 */
export function convertConsumptionLogApiToModel(apiLog: api.ConsumptionLogDto): ConsumptionLog {
    return {
        id: apiLog.id,
        productId: apiLog.productId,
        quantity: apiLog.quantity,
        reason: apiLog.reason ?? undefined,
        lastModified: apiLog.lastModified,
        dateCreated: apiLog.dateCreated,
    };
}
