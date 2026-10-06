import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { PrimeReactProvider } from "@/primereact";
import FormCalendar from "./formCalendar";

interface TestFormData {
    date?: string;
}

/** Hosts the calendar in a form and shows the field value, so tests can read what the calendar writes. */
const TestForm: React.FC<{ date?: string }> = ({ date }) => {
    const form = useForm<TestFormData>({ defaultValues: { date } });
    return (
        <>
            <FormCalendar name="date" form={form} label="Date" data-test_id="TestForm__Date" />
            <span data-test_id="TestForm__Value">{form.watch("date") ?? ""}</span>
        </>
    );
};

function renderTestForm(date?: string): ReturnType<typeof render> {
    return render(
        <PrimeReactProvider>
            <TestForm date={date} />
        </PrimeReactProvider>
    );
}

function dateInput(container: HTMLElement): HTMLInputElement {
    return container.querySelector("[data-test_id='TestForm__Date'] input") as HTMLInputElement;
}

function fieldValue(container: HTMLElement): string | null | undefined {
    return container.querySelector("[data-test_id='TestForm__Value']")?.textContent;
}

describe("FormCalendar", () => {
    it("FormCalendar: shows the field's ISO date as DD-MMM-YYYY", () => {
        // Arrange / Act
        const { container } = renderTestForm("2026-10-19");

        // Assert
        expect(dateInput(container).value).toBe("19-Oct-2026");
    });

    it("FormCalendar: leaves the input empty while the field holds no date", () => {
        // Arrange / Act
        const { container } = renderTestForm("");

        // Assert
        expect(dateInput(container).value).toBe("");
    });

    it("FormCalendar: picking a day writes it to the field as an ISO date", () => {
        // Arrange
        const { container } = renderTestForm("2026-10-19");
        fireEvent.click(container.querySelector("[data-test_id='TestForm__Date'] button") as Element);
        // PrimeReact's own day attributes; months are zero-based, so 9 is October.
        const day = document.body.querySelector("td[data-p-year='2026'][data-p-month='9'][data-p-day='20'] > span") as Element;

        // Act
        fireEvent.click(day);

        // Assert
        expect(fieldValue(container)).toBe("2026-10-20");
        expect(dateInput(container).value).toBe("20-Oct-2026");
    });
});
