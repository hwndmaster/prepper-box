import { ConsumptionLogRef, ProductRef } from "./types";

/**
 * Represents a consumption log entry.
 */
interface ConsumptionLog {
    id: ConsumptionLogRef;
    productId: ProductRef;
    quantity: number;
    reason?: string;

    lastModified: string;
    dateCreated: Date;
}

export default ConsumptionLog;
