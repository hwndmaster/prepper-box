import { dateToTicks } from "@hwndmaster/atom-web-core";
import { formatDate, formatTicksAsDate, isoDateToLocalDate, localDateToIsoDate } from "./dateFormat";

describe("dateFormat", () => {
    it("formatDate: formats a date as DD-MMM-YYYY", () => {
        // Arrange
        const date = new Date(2026, 7, 3);

        // Act
        const result = formatDate(date);

        // Assert
        expect(result).toBe("03-Aug-2026");
    });

    it("formatDate: pads single-digit days and keeps two-digit days intact", () => {
        // Arrange, Act, Assert
        expect(formatDate(new Date(2026, 0, 9))).toBe("09-Jan-2026");
        expect(formatDate(new Date(2026, 11, 31))).toBe("31-Dec-2026");
    });

    it("formatTicksAsDate: formats a tick value as DD-MMM-YYYY", () => {
        // Arrange
        const ticks = dateToTicks(new Date(2026, 7, 3, 14, 30));

        // Act
        const result = formatTicksAsDate(ticks);

        // Assert
        expect(result).toBe("03-Aug-2026");
    });

    it("isoDateToLocalDate: reads the date as local midnight of that calendar day", () => {
        // Arrange, Act
        const result = isoDateToLocalDate("2026-10-19");

        // Assert
        expect(result).toEqual(new Date(2026, 9, 19));
    });

    it("isoDateToLocalDate: returns undefined for a missing or malformed date", () => {
        // Arrange, Act, Assert
        expect(isoDateToLocalDate(undefined)).toBeUndefined();
        expect(isoDateToLocalDate("")).toBeUndefined();
        expect(isoDateToLocalDate("19-Oct-2026")).toBeUndefined();
    });

    it("localDateToIsoDate: formats the local calendar day, whatever the time of day", () => {
        // Arrange
        const date = new Date(2026, 0, 9, 23, 30);

        // Act
        const result = localDateToIsoDate(date);

        // Assert
        expect(result).toBe("2026-01-09");
    });

    it("localDateToIsoDate: returns undefined when there is no valid date", () => {
        // Arrange, Act, Assert
        expect(localDateToIsoDate(null)).toBeUndefined();
        expect(localDateToIsoDate(undefined)).toBeUndefined();
        expect(localDateToIsoDate(new Date(Number.NaN))).toBeUndefined();
    });
});
