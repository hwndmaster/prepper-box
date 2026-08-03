import { dateToTicks } from "@hwndmaster/atom-web-core";
import { formatDate, formatTicksAsDate } from "./dateFormat";

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
});
