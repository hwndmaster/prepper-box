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
