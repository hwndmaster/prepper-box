import { ticksToDate } from "@hwndmaster/atom-web-core";

const MonthAbbreviations = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Formats a date in the unambiguous day-first form used across the app, e.g. "03-Aug-2026".
 * Built explicitly rather than via `toLocaleDateString` so the output never follows the
 * browser locale (which yields the ambiguous American M/D/YYYY on many machines).
 * @param date The date to format.
 * @returns The formatted date as "DD-MMM-YYYY".
 */
export function formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, "0");
    const month = MonthAbbreviations[date.getMonth()];
    const year = String(date.getFullYear()).padStart(4, "0");
    return `${day}-${month}-${year}`;
}

/**
 * Formats a .NET DateTimeOffset tick value as "DD-MMM-YYYY".
 * @param ticks The tick value, as carried by the API models.
 * @returns The formatted date.
 */
export function formatTicksAsDate(ticks: number): string {
    return formatDate(ticksToDate(ticks));
}

/**
 * Converts an ISO "YYYY-MM-DD" date, as forms hold it, into a local Date at midnight.
 * Parsed part by part, because `new Date("YYYY-MM-DD")` reads the string as UTC midnight,
 * which falls on the previous day west of Greenwich.
 * @param isoDate The ISO date, or undefined.
 * @returns The local date, or undefined when the value is missing or malformed.
 */
export function isoDateToLocalDate(isoDate: string | undefined): Date | undefined {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate ?? "");
    if (match == null) {
        return undefined;
    }

    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

/**
 * Formats a Date as an ISO "YYYY-MM-DD" date, as forms hold it, using its local calendar day.
 * @param date The date, or null/undefined when there is none.
 * @returns The ISO date, or undefined when there is no valid date.
 */
export function localDateToIsoDate(date: Date | null | undefined): string | undefined {
    if (date == null || Number.isNaN(date.getTime())) {
        return undefined;
    }

    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${String(date.getFullYear()).padStart(4, "0")}-${month}-${day}`;
}
