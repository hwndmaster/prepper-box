import React, { useMemo } from "react";
import { Button, Chip, Tooltip } from "@/primereact";
import * as store from "@/store";
import ProductFamily from "@/models/productFamily";
import { CategoryRef } from "@/models/types";
import { getFamiliesNeedingRestock } from "@/shared/restockList";
import { StockValidationLevel } from "@/shared/stockValidation";
import { UnitOfMeasureLabels } from "@/shared/unitOfMeasureLabels";
import styles from "./restockPanel.module.scss";

interface RestockPanelProps {
    categoryId: CategoryRef | null;
    onAddProduct: (family: ProductFamily) => void;
}

/**
 * Lists the families of the selected category that sit below their minimum stock level, including
 * those without any products — precisely the ones the grouped products table cannot surface, since
 * it only renders a family header for a family that has at least one product row.
 */
const RestockPanel: React.FC<RestockPanelProps> = ({ categoryId, onAddProduct }) => {
    const productFamilies = store.useAppSelector((state) => state.productFamilies.productFamilies);
    const familyAggregates = store.useAppSelector(store.TrackedProducts.Selectors.selectStockAggregatesByFamilyId);

    const entries = useMemo(
        () => getFamiliesNeedingRestock(productFamilies, familyAggregates, categoryId),
        [productFamilies, familyAggregates, categoryId]
    );

    if (entries.length === 0) {
        return null;
    }

    return (
        <div className={styles.panel} data-test_id="Home__Restock_Panel">
            <div className={styles.panelHeader}>
                <i className="pi pi-exclamation-circle" />
                <span>Needs restocking ({entries.length})</span>
            </div>
            <ul className={styles.list}>
                {entries.map((entry) => {
                    const isDanger = entry.level === StockValidationLevel.Danger;
                    const tooltipId = `restock-tooltip-${String(entry.family.id)}`;

                    return (
                        <li key={entry.family.id} className={styles.item} data-test_id="Home__Restock_Family">
                            <Chip
                                label={isDanger ? "❗" : "⚠️"}
                                className={`${isDanger ? styles.chipDanger : styles.chipWarning} ${tooltipId}`}
                            />
                            <Tooltip target={`.${tooltipId}`} position="top">
                                <ul className={styles.reasonList}>
                                    {entry.reasons.map((reason, i) => <li key={i}>{reason}</li>)}
                                </ul>
                            </Tooltip>
                            <span className={styles.name}>{entry.family.name}</span>
                            <span className={styles.meta}>
                                {entry.count} of {entry.family.minimumStockLevel} {UnitOfMeasureLabels[entry.family.unitOfMeasure]}
                            </span>
                            <Button
                                label="Add Product"
                                icon="pi pi-plus"
                                severity="secondary"
                                text
                                className={styles.action}
                                data-test_id="Home__Restock_Add_Product"
                                onClick={() => onAddProduct(entry.family)}
                            />
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default RestockPanel;
