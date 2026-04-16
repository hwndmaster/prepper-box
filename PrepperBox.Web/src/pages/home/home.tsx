import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Chip, Column, DataTable, SplitButton, TabPanel, TabView, Tooltip } from "@/primereact";
import type { DataTableExpandedRows, MenuItem } from "@/primereact";
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
import { toastService } from "@/shared/ui/toastService";
import { LoadingSpinner } from "@/components/loadingSpinner";
import BarcodeScannerDialog from "./barcodeScannerDialog";
import ProductSelectionDialog from "./productSelectionDialog";
import WithdrawStockDialog from "./withdrawStockDialog";
import styles from "./home.module.scss";

const Home: React.FC = () => {
    const dispatch = store.useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const locationState = location.state as { selectedCategoryId?: number } | null;
    const categories = store.useAppSelector((state) => state.categories.categories);
    const products = store.useAppSelector((state) => state.products.products);
    const storageLocations = store.useAppSelector((state) => state.storageLocations.storageLocations);
    const trackedProducts = store.useAppSelector((state) => state.trackedProducts.trackedProducts);

    const [selectedCategoryId, setSelectedCategoryId] = useState<CategoryRef | null>(null);
    const [expandedRows, setExpandedRows] = useState<DataTableExpandedRows>({});
    const [expandedTrackedRows, setExpandedTrackedRows] = useState<TrackedProduct[]>([]);
    const [isWithdrawDialogVisible, setIsWithdrawDialogVisible] = useState(false);
    const [withdrawTrackedProduct, setWithdrawTrackedProduct] = useState<TrackedProduct | null>(null);
    const [isScannerVisible, setIsScannerVisible] = useState(false);
    const [matchedProducts, setMatchedProducts] = useState<Product[]>([]);
    const [isProductSelectionVisible, setIsProductSelectionVisible] = useState(false);

    useEffect(() => {
        dispatch(store.Categories.Actions.fetchCategories());
        dispatch(store.Products.Actions.fetchProducts());
        dispatch(store.StorageLocations.Actions.fetchStorageLocations());
        dispatch(store.TrackedProducts.Actions.fetchTrackedProducts());
    }, [dispatch]);

    useEffect(() => {
        if (selectedCategoryId == null && categories.length > 0) {
            const restoredId = locationState?.selectedCategoryId;
            const match = restoredId != null ? categories.find((c) => c.id === restoredId) : null;
            setSelectedCategoryId(match != null ? match.id : categories[0].id);
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
        setIsWithdrawDialogVisible(true);
    };

    const handleWithdrawConfirm = (withdrawnQuantity: number): void => {
        if (withdrawTrackedProduct == null) {
            return;
        }

        const productName = products.find((p) => p.id === withdrawTrackedProduct.productId)?.name ?? "Unknown";

        dispatch(store.TrackedProducts.Actions.withdrawTrackedProduct(
            {
                trackedProductId: withdrawTrackedProduct.id,
                quantity: withdrawnQuantity,
            },
            () => {
                toastService.showSuccess(`${String(withdrawnQuantity)} items were withdrawn from product ${productName}`);
            }
        ));

        setIsWithdrawDialogVisible(false);
        setWithdrawTrackedProduct(null);
    };

    const handleWithdrawCancel = (): void => {
        setIsWithdrawDialogVisible(false);
        setWithdrawTrackedProduct(null);
    };

    const handleBarcodeScan = (barcode: string): void => {
        setIsScannerVisible(false);
        dispatch(store.Products.Actions.fetchProductsByBarCode(barcode, (foundProducts) => {
            if (foundProducts == null || foundProducts.length === 0) {
                void goTo(navigate, AppRoutes.AddProduct, undefined, { barCode: barcode, selectedCategoryId: selectedCategoryId ?? 0 });
            } else if (foundProducts.length === 1) {
                void goTo(navigate, AppRoutes.AddTrackedProduct, { productId: foundProducts[0].id }, { selectedCategoryId: selectedCategoryId ?? 0 });
            } else {
                setMatchedProducts(foundProducts);
                setIsProductSelectionVisible(true);
            }
        }));
    };

    const handleProductSelect = (product: Product): void => {
        setIsProductSelectionVisible(false);
        setMatchedProducts([]);
        void goTo(navigate, AppRoutes.AddTrackedProduct, { productId: product.id }, { selectedCategoryId: selectedCategoryId ?? 0 });
    };

    const handleProductSelectionCancel = (): void => {
        setIsProductSelectionVisible(false);
        setMatchedProducts([]);
    };

    const addProductMenuItems: MenuItem[] = [
        {
            label: "Scan Barcode",
            icon: "pi pi-camera",
            command: () => setIsScannerVisible(true),
        },
    ];

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
                if (a.expirationDate == null) return -1;
                if (b.expirationDate == null) return 1;
                return a.expirationDate - b.expirationDate;
            });
        const uomLabel = UnitOfMeasureLabels[product.unitOfMeasure];

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
                        onClick={() => void goTo(navigate, AppRoutes.AddTrackedProduct, { productId: product.id }, { selectedCategoryId: selectedCategoryId ?? 0 })}
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
            <div className={styles.nameCell}>
                {product.imageSmallUrl != null && (
                    <div className={styles.avatar}>
                        <img src={product.imageSmallUrl} alt={product.name} />
                    </div>
                )}
                <span
                    className={styles.clickableName}
                    data-test_id="Home__Product_Name"
                    onClick={() => toggleRowExpansion(product)}
                >
                    {label}
                </span>
            </div>
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
                onClick={() => void goTo(navigate, AppRoutes.EditProduct, { productId: product.id }, { selectedCategoryId: selectedCategoryId ?? 0 })}
            />
        );
    };

    return (
        <LoadingSpinner target={LoadingTargets.ActiveView}>
            <div className={styles.header}>
                <TabView
                    scrollable
                    className={styles.categoryTabView}
                    activeIndex={Math.max(0, categories.findIndex((c) => c.id === selectedCategoryId))}
                    onTabChange={(e) => setSelectedCategoryId(categories[e.index].id)}
                    data-test_id="Home__Category_Tabs"
                >
                    {categories.map((category) => (
                        <TabPanel
                            key={category.id}
                            header={category.name}
                            leftIcon={getCategoryIconClass(category.iconName)}
                        />
                    ))}
                </TabView>
                <div className={styles.headerRight}>
                    <SplitButton
                        label="Add Product"
                        icon="pi pi-plus"
                        severity="success"
                        model={addProductMenuItems}
                        data-test_id="Home__Add_Product"
                        onClick={() => void goTo(navigate, AppRoutes.AddProduct, undefined, { barCode: "", selectedCategoryId: selectedCategoryId ?? 0 })}
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

            <WithdrawStockDialog
                trackedProduct={withdrawTrackedProduct}
                visible={isWithdrawDialogVisible}
                onConfirm={handleWithdrawConfirm}
                onCancel={handleWithdrawCancel}
            />

            <BarcodeScannerDialog
                visible={isScannerVisible}
                onScan={handleBarcodeScan}
                onCancel={() => setIsScannerVisible(false)}
            />

            <ProductSelectionDialog
                visible={isProductSelectionVisible}
                products={matchedProducts}
                onSelect={handleProductSelect}
                onCancel={handleProductSelectionCancel}
            />
        </LoadingSpinner>
    );
};

export default Home;
