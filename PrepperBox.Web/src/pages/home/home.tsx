import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Chip } from "primereact/chip";
import { Column } from "primereact/column";
import { DataTable, DataTableExpandedRows } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { Tooltip } from "primereact/tooltip";
import * as store from "@/store";
import Product from "@/models/product";
import TrackedProduct from "@/models/trackedProduct";
import { CategoryRef, ProductRef, storageLocationRef } from "@/models/types";
import LoadingTargets from "@/shared/loadingTargets";
import AppRoutes, { goTo } from "@/shared/routes";
import { getCategoryIconClass } from "@/shared/categoryIcons";
import { ticksToDate } from "@/shared/helper";
import { StockValidationLevel, validateStockLevel } from "@/shared/stockValidation";
import { UnitOfMeasureLabels } from "@/shared/unitOfMeasureLabels";
import { LoadingSpinner } from "@/components/loadingSpinner";
import styles from "./home.module.scss";


const Home: React.FC = () => {
    const dispatch = store.useAppDispatch();
    const navigate = useNavigate();
    const categories = store.useAppSelector((state) => state.categories.categories);
    const products = store.useAppSelector((state) => state.products.products);
    const storageLocations = store.useAppSelector((state) => state.storageLocations.storageLocations);
    const trackedProducts = store.useAppSelector((state) => state.trackedProducts.trackedProducts);

    const [selectedCategoryId, setSelectedCategoryId] = useState<CategoryRef | null>(null);
    const [expandedRows, setExpandedRows] = useState<DataTableExpandedRows>({});
    const [expandedTrackedRows, setExpandedTrackedRows] = useState<TrackedProduct[]>([]);
    const [isWithdrawDialogVisible, setIsWithdrawDialogVisible] = useState(false);
    const [withdrawTrackedProduct, setWithdrawTrackedProduct] = useState<TrackedProduct | null>(null);
    const [withdrawQuantity, setWithdrawQuantity] = useState<number>(1);

    useEffect(() => {
        dispatch(store.Categories.Actions.fetchCategories());
        dispatch(store.Products.Actions.fetchProducts());
        dispatch(store.StorageLocations.Actions.fetchStorageLocations());
        dispatch(store.TrackedProducts.Actions.fetchTrackedProducts());
    }, [dispatch]);

    useEffect(() => {
        if (selectedCategoryId == null && categories.length > 0) {
            setSelectedCategoryId(categories[0].id);
        }
    }, [categories, selectedCategoryId]);

    const filteredProducts = useMemo(
        () => products.filter((p) => p.categoryId === selectedCategoryId),
        [products, selectedCategoryId]
    );

    const trackedProductsByProductId = useMemo(() => {
        const map = new Map<ProductRef, TrackedProduct[]>();
        for (const tp of trackedProducts) {
            const list = map.get(tp.productId) ?? [];
            list.push(tp);
            map.set(tp.productId, list);
        }
        return map;
    }, [trackedProducts]);

    const handleOpenWithdrawDialog = (tp: TrackedProduct): void => {
        setWithdrawTrackedProduct(tp);
        setWithdrawQuantity(1);
        setIsWithdrawDialogVisible(true);
    };

    const handleWithdrawConfirm = (): void => {
        if (withdrawTrackedProduct == null) {
            return;
        }

        dispatch(store.ConsumptionLogs.Actions.createConsumptionLog(
            {
                productId: withdrawTrackedProduct.productId,
                quantity: withdrawQuantity,
                reason: "Withdrawn from stock"
            },
            () => {
                const newQuantity = withdrawTrackedProduct.quantity - withdrawQuantity;
                if (newQuantity <= 0) {
                    dispatch(store.TrackedProducts.Actions.deleteTrackedProduct(withdrawTrackedProduct.id));
                } else {
                    dispatch(store.TrackedProducts.Actions.updateTrackedProduct({
                        ...withdrawTrackedProduct,
                        quantity: newQuantity,
                        expirationDate: withdrawTrackedProduct.expirationDate,
                        notes: withdrawTrackedProduct.notes,
                    }));
                }
            }
        ));

        setIsWithdrawDialogVisible(false);
        setWithdrawTrackedProduct(null);
    };

    const handleWithdrawCancel = (): void => {
        setIsWithdrawDialogVisible(false);
        setWithdrawTrackedProduct(null);
    };

    const expirationDateTemplate = (tp: TrackedProduct): React.ReactNode => {
        if (tp.expirationDate == null) {
            return <span>—</span>;
        }
        return <span>{ticksToDate(tp.expirationDate).toLocaleDateString()}</span>;
    };

    const withdrawActionTemplate = (tp: TrackedProduct): React.ReactNode => {
        return (
            <Button
                icon="pi pi-minus"
                severity="warning"
                text
                rounded
                data-test_id="Home__Withdraw_TrackedProduct"
                onClick={() => handleOpenWithdrawDialog(tp)}
            />
        );
    };

    const rowExpansionTemplate = (product: Product): React.ReactNode => {
        const productTrackedProducts = [...(trackedProductsByProductId.get(product.id) ?? [])]
            .sort((a, b) => {
                if (a.expirationDate == null && b.expirationDate == null) return 0;
                if (a.expirationDate == null) return 1;
                if (b.expirationDate == null) return -1;
                return b.expirationDate - a.expirationDate;
            });
        const uomLabel = UnitOfMeasureLabels[product.unitOfMeasure];
        const category = categories.find((c) => c.id === product.categoryId);

        const quantityTemplate = (tp: TrackedProduct): React.ReactNode => {
            return <span>{tp.quantity} {uomLabel}</span>;
        };

        const storageLocationTemplate = (tp: TrackedProduct): React.ReactNode => {
            if (tp.storageLocationId === storageLocationRef.default()) {
                return <span>—</span>;
            }
            const location = storageLocations.find((s) => s.id === tp.storageLocationId);
            return <span>{location?.name ?? `#${String(tp.storageLocationId)}`}</span>;
        };

        const trackedProductExpansionTemplate = (tp: TrackedProduct): React.ReactNode => {
            if (tp.notes == null || tp.notes === "") {
                return null;
            }
            return (
                <div className={styles.trackedProductNotes}>
                    {tp.notes}
                </div>
            );
        };

        const allowTrackedExpansion = (tp: TrackedProduct): boolean => {
            return tp.notes != null && tp.notes !== "";
        };

        return (
            <div className={styles.expandableContent}>
                <div className={styles.productDetails}>
                    {product.description != null && product.description !== "" && (
                        <div><strong>Description:</strong> {product.description}</div>
                    )}
                    {product.manufacturer != null && product.manufacturer !== "" && (
                        <div><strong>Manufacturer:</strong> {product.manufacturer}</div>
                    )}
                    {product.barCode != null && product.barCode !== "" && (
                        <div><strong>Bar Code:</strong> {product.barCode}</div>
                    )}
                    <div><strong>Category:</strong> {category?.name ?? "—"}</div>
                    <div><strong>Unit of Measure:</strong> {uomLabel}</div>
                    <div><strong>Minimum Stock Level:</strong> {product.minimumStockLevel}</div>
                </div>
                <DataTable
                    value={productTrackedProducts}
                    expandedRows={expandedTrackedRows}
                    onRowToggle={(e) => setExpandedTrackedRows(e.data as TrackedProduct[])}
                    rowExpansionTemplate={trackedProductExpansionTemplate}
                    dataKey="id"
                    data-test_id="Home__TrackedProducts_Table"
                >
                    <Column expander={allowTrackedExpansion} className={styles.expanderColumn} />
                    <Column field="expirationDate" header="Expiration" body={expirationDateTemplate} />
                    <Column field="quantity" header="Quantity" body={quantityTemplate} />
                    <Column field="storageLocationId" header="Storage" body={storageLocationTemplate} />
                    <Column header="Actions" body={withdrawActionTemplate} className={styles.actionColumn} />
                </DataTable>
                <div className={styles.addRowButton}>
                    <Button
                        label="Add Tracked Product"
                        icon="pi pi-plus"
                        severity="secondary"
                        text
                        data-test_id="Home__Add_TrackedProduct"
                        onClick={() => void goTo(navigate, AppRoutes.AddTrackedProduct, { productId: product.id })}
                    />
                </div>
            </div>
        );
    };

    const toggleRowExpansion = (product: Product): void => {
        setExpandedRows(prev => {
            const key = String(product.id);
            const next = { ...prev };
            if (next[key]) {
                delete next[key];
            } else {
                next[key] = true;
            }
            return next;
        });
    };

    const nameTemplate = (product: Product): React.ReactNode => {
        const label = product.manufacturer != null && product.manufacturer !== ""
            ? `${product.name}, ${product.manufacturer}`
            : product.name;
        return (
            <span
                className={styles.clickableName}
                data-test_id="Home__Product_Name"
                onClick={() => toggleRowExpansion(product)}
            >
                {label}
            </span>
        );
    };

    const stockLevelTemplate = (product: Product): React.ReactNode => {
        const count = product.trackedProductsCount;
        const min = product.minimumStockLevel;
        const productTPs = trackedProductsByProductId.get(product.id) ?? [];
        const validation = validateStockLevel(count, min, productTPs);
        const tooltipId = `stock-tooltip-${String(product.id)}`;

        return (
            <div className={styles.stockCell}>
                {min > 0 && <span>{count} of {min}</span>}
                {min === 0 && <span>{count}</span>}
                {validation.level === StockValidationLevel.Danger && (
                    <>
                        <Chip
                            label="❗"
                            className={`${styles.stockChipDanger} ${tooltipId}`}
                            data-test_id="Home__Stock_Attention"
                        />
                        <Tooltip target={`.${tooltipId}`} position="top">
                            <ul style={{ margin: 0, paddingLeft: "1rem" }}>
                                {validation.reasons.map((reason, i) => <li key={i}>{reason}</li>)}
                            </ul>
                        </Tooltip>
                    </>
                )}
                {validation.level === StockValidationLevel.Warning && (
                    <>
                        <Chip
                            label="⚠️"
                            className={`${styles.stockChipWarning} ${tooltipId}`}
                            data-test_id="Home__Stock_Warning"
                        />
                        <Tooltip target={`.${tooltipId}`} position="top">
                            <ul style={{ margin: 0, paddingLeft: "1rem" }}>
                                {validation.reasons.map((reason, i) => <li key={i}>{reason}</li>)}
                            </ul>
                        </Tooltip>
                    </>
                )}
            </div>
        );
    };

    const editActionTemplate = (product: Product): React.ReactNode => {
        return (
            <Button
                icon="pi pi-pencil"
                severity="info"
                text
                rounded
                data-test_id="Home__Edit_Product"
                onClick={() => void goTo(navigate, AppRoutes.EditProduct, { productId: product.id })}
            />
        );
    };

    return (
        <LoadingSpinner target={LoadingTargets.ActiveView}>
            <div className={styles.header}>
                <div className={styles.categoryTabs} data-test_id="Home__Category_Tabs">
                    {categories.map((category) => (
                        <Button
                            key={category.id}
                            label={category.name}
                            icon={getCategoryIconClass(category.iconName)}
                            severity={category.id === selectedCategoryId ? undefined : "secondary"}
                            outlined={category.id !== selectedCategoryId}
                            data-test_id="Home__Category_Button"
                            onClick={() => setSelectedCategoryId(category.id)}
                        />
                    ))}
                </div>
                <div className={styles.headerRight}>
                    <Button
                        label="Add Product"
                        icon="pi pi-plus"
                        severity="success"
                        data-test_id="Home__Add_Product"
                        onClick={() => void goTo(navigate, AppRoutes.AddProduct)}
                    />
                </div>
            </div>

            <DataTable
                value={filteredProducts}
                expandedRows={expandedRows}
                onRowToggle={(e) => setExpandedRows(e.data as DataTableExpandedRows)}
                rowExpansionTemplate={rowExpansionTemplate}
                dataKey="id"
                data-test_id="Home__Products_Table"
            >
                <Column expander className={styles.expanderColumn} />
                <Column field="name" header="Name" body={nameTemplate} />
                <Column field="trackedProductsCount" header="Stock" body={stockLevelTemplate} />
                <Column header="" body={editActionTemplate} className={styles.actionColumn} />
            </DataTable>

            <Dialog
                header="Withdraw Stock"
                visible={isWithdrawDialogVisible}
                onHide={handleWithdrawCancel}
                className={styles.withdrawDialog}
                data-test_id="Home__Withdraw_Dialog"
            >
                <div className={styles.withdrawContent}>
                    <p>Select the quantity to withdraw:</p>
                    <InputNumber
                        value={withdrawQuantity}
                        onValueChange={(e) => {
                            const max = withdrawTrackedProduct?.quantity ?? 1;
                            const val = e.value ?? 1;
                            setWithdrawQuantity(Math.min(Math.max(val, 1), max));
                        }}
                        min={1}
                        max={withdrawTrackedProduct?.quantity ?? 1}
                        showButtons
                        data-test_id="Home__Withdraw_Quantity"
                    />
                    <div className={styles.withdrawActions}>
                        <Button
                            label="Withdraw"
                            severity="warning"
                            data-test_id="Home__Withdraw_Confirm"
                            onClick={handleWithdrawConfirm}
                        />
                        <Button
                            label="Cancel"
                            severity="secondary"
                            outlined
                            data-test_id="Home__Withdraw_Cancel"
                            onClick={handleWithdrawCancel}
                        />
                    </div>
                </div>
            </Dialog>
        </LoadingSpinner>
    );
};

export default Home;
