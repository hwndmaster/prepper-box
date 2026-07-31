import React from "react";
import { act, fireEvent, render, renderHook } from "@testing-library/react";
import { useRowExpansion } from "./useRowExpansion";

interface TestRow {
    id: number;
}

const getRowKey = (row: TestRow): number => row.id;
const rowA: TestRow = { id: 1 };
const rowB: TestRow = { id: 2 };

/** Renders the expander cell exactly as a DataTable column body would. */
const Harness: React.FC = () => {
    const { expanderTemplate, isRowExpanded } = useRowExpansion<TestRow>(getRowKey);
    return (
        <div>
            {expanderTemplate(rowA)}
            <span data-test_id="Harness__Expanded">{String(isRowExpanded(rowA))}</span>
        </div>
    );
};

describe("useRowExpansion", () => {
    it("useRowExpansion: starts with nothing expanded", () => {
        // Arrange / Act
        const { result } = renderHook(() => useRowExpansion<TestRow>(getRowKey));

        // Assert
        expect(result.current.expandedRows).toEqual({});
        expect(result.current.isRowExpanded(rowA)).toBe(false);
    });

    it("toggleRow: expands a collapsed row keyed by its row key", () => {
        // Arrange
        const { result } = renderHook(() => useRowExpansion<TestRow>(getRowKey));

        // Act
        act(() => { result.current.toggleRow(rowA); });

        // Assert - the keyed-object shape is what DataTable's render path reads.
        expect(result.current.expandedRows).toEqual({ "1": true });
        expect(result.current.isRowExpanded(rowA)).toBe(true);
    });

    it("toggleRow: collapses an already expanded row", () => {
        // Arrange
        const { result } = renderHook(() => useRowExpansion<TestRow>(getRowKey));
        act(() => { result.current.toggleRow(rowA); });

        // Act
        act(() => { result.current.toggleRow(rowA); });

        // Assert
        expect(result.current.expandedRows).toEqual({});
        expect(result.current.isRowExpanded(rowA)).toBe(false);
    });

    it("toggleRow: leaves the other expanded rows untouched", () => {
        // Arrange
        const { result } = renderHook(() => useRowExpansion<TestRow>(getRowKey));
        act(() => { result.current.toggleRow(rowA); });
        act(() => { result.current.toggleRow(rowB); });

        // Act
        act(() => { result.current.toggleRow(rowA); });

        // Assert
        expect(result.current.isRowExpanded(rowA)).toBe(false);
        expect(result.current.isRowExpanded(rowB)).toBe(true);
    });

    it("expanderTemplate: toggles the row and flips the chevron when clicked", () => {
        // Arrange
        const { container } = render(<Harness />);
        const toggle = container.querySelector("[data-test_id='RowExpander__Toggle']");
        expect(toggle?.querySelector(".pi-chevron-right")).not.toBeNull();
        expect(container.querySelector("[data-test_id='Harness__Expanded']")?.textContent).toBe("false");

        // Act
        fireEvent.click(toggle as Element);

        // Assert
        expect(container.querySelector("[data-test_id='Harness__Expanded']")?.textContent).toBe("true");
        expect(container.querySelector("[data-test_id='RowExpander__Toggle'] .pi-chevron-down")).not.toBeNull();
    });
});
