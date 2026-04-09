import { ConsumptionLogRef, ProductRef } from "./types";

/**
 * Represents a consumption log entry.
 */
interface ConsumptionLog {
    id: ConsumptionLogRef;
    productId: ProductRef;
    quantity: number;
    reason?: string;

    lastModified: number;
    dateCreated: number;
}

export default ConsumptionLog;
