import { ticksToDate } from "@hwndmaster/atom-web-core";

export enum StockValidationLevel {
    None = "none",
    Warning = "warning",
    Danger = "danger",
}

export interface StockValidationResult {
    level: StockValidationLevel;
    reasons: string[];
}

/**
 * Validates the stock level based on the count, minimum stock level, and tracked products with expiration dates.
 * @param count The current stock count.
 * @param minimumStockLevel The minimum stock level.
 * @param trackedProducts The list of tracked products with optional expiration dates (as ticks).
 * @returns The stock validation result, including the validation level and reasons.
 */
export function validateStockLevel(
    count: number,
    minimumStockLevel: number,
    trackedProducts: { expirationDate?: number }[]
): StockValidationResult {
    const reasons: string[] = [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneMonthFromNow = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

    const isLowStock = minimumStockLevel > 0 && count < minimumStockLevel * 0.5;
    const isWarningStock = !isLowStock && minimumStockLevel > 0 && count >= minimumStockLevel * 0.5 && count < minimumStockLevel;

    if (isLowStock) {
        reasons.push("Stock is below 50% of the minimum level");
    } else if (isWarningStock) {
        reasons.push("Stock is below the minimum level");
    }

    for (const tp of trackedProducts) {
        if (tp.expirationDate != null) {
            const expiration = ticksToDate(tp.expirationDate);
            const expDate = new Date(expiration.getFullYear(), expiration.getMonth(), expiration.getDate());

            if (expDate < today) {
                reasons.push("Has expired items in stock");
            } else if (expDate.getTime() === today.getTime()) {
                reasons.push("Has items expiring today");
            } else if (expiration <= oneMonthFromNow) {
                const daysUntil = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                reasons.push(`Has items expiring in ${daysUntil} day${daysUntil !== 1 ? "s" : ""}`);
            }
        }
    }

    const hasExpiringSoon = trackedProducts.some(
        (tp) => tp.expirationDate != null && ticksToDate(tp.expirationDate) <= oneMonthFromNow
    );

    if (isLowStock || hasExpiringSoon) {
        return { level: StockValidationLevel.Danger, reasons };
    }

    if (isWarningStock) {
        return { level: StockValidationLevel.Warning, reasons };
    }

    return { level: StockValidationLevel.None, reasons: [] };
}
