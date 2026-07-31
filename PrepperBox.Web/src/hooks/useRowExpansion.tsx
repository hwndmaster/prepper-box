import React, { useCallback, useState } from "react";
import type { DataTableExpandedRows } from "@/primereact";

interface RowExpansion<T> {
    /** Pass straight to `DataTable.expandedRows`. */
    expandedRows: DataTableExpandedRows;
    /** Whether the given row is currently expanded. */
    isRowExpanded: (row: T) => boolean;
    /** Expands a collapsed row and collapses an expanded one. */
    toggleRow: (row: T) => void;
    /** Body template for the expander column — use this instead of `Column.expander`. */
    expanderTemplate: (row: T) => React.ReactNode;
}

/**
 * Owns DataTable row-expansion state and renders the expander cell itself.
 *
 * Why not `Column.expander`: PrimeReact 10.9.8 decides how to store expansion state with
 * `hasDataKey = groupRowsBy ? dataKey === groupRowsBy : !!dataKey`. A table that groups by one
 * field but is keyed by another (`groupRowsBy="familyId"` + `dataKey="id"`) therefore falls into
 * the array branch, which calls `.findIndex` on the value it was handed — throwing for a keyed
 * object and silently killing the expander arrow. Its render-side check accepts a keyed object
 * fine, so this hook keeps that shape and simply never invokes the broken write path: the
 * expander cell dispatches `toggleRow` directly, exactly like any other custom trigger.
 *
 * Consequence for consumers: set `dataKey` on the DataTable and do **not** pass `onRowToggle`
 * or `expander`. Works the same for grouped and ungrouped tables.
 *
 * @param getRowKey Returns the row's unique key. Keep it stable (module scope or `useCallback`).
 */
export function useRowExpansion<T>(getRowKey: (row: T) => string | number): RowExpansion<T> {
    const [expandedRows, setExpandedRows] = useState<DataTableExpandedRows>({});

    const isRowExpanded = useCallback(
        (row: T): boolean => expandedRows[String(getRowKey(row))] === true,
        [expandedRows, getRowKey]
    );

    const toggleRow = useCallback((row: T): void => {
        const key = String(getRowKey(row));
        setExpandedRows((current) => {
            const next = { ...current };
            if (next[key] === true) {
                delete next[key];
            } else {
                next[key] = true;
            }
            return next;
        });
    }, [getRowKey]);

    const expanderTemplate = useCallback((row: T): React.ReactNode => {
        const isExpanded = isRowExpanded(row);
        return (
            <button
                type="button"
                // Reuses PrimeReact's own toggler classes so the themed look stays identical.
                className="p-row-toggler p-link"
                aria-expanded={isExpanded}
                aria-label={isExpanded ? "Collapse row" : "Expand row"}
                data-test_id="RowExpander__Toggle"
                onClick={() => toggleRow(row)}
            >
                <span className={`p-row-toggler-icon pi ${isExpanded ? "pi-chevron-down" : "pi-chevron-right"}`} />
            </button>
        );
    }, [isRowExpanded, toggleRow]);

    return { expandedRows, isRowExpanded, toggleRow, expanderTemplate };
}
