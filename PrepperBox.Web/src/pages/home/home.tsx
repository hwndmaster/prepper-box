import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { toastService } from "@hwndmaster/atom-react-prime";
import { LoadingSpinner } from "@hwndmaster/atom-react-redux";
import { goTo } from "@hwndmaster/atom-react-core";
import type { MenuItem } from "@/primereact";
import { Button, Chip, Column, DataTable, IconField, InputIcon, InputSwitch, InputText, SplitButton, TabPanel, TabView, Tooltip } from "@/primereact";
import { useRowExpansion } from "@/hooks/useRowExpansion";
import * as store from "@/store";
import Product from "@/models/product";
import ProductFamily from "@/models/productFamily";
import TrackedProduct from "@/models/trackedProduct";
import { CategoryRef, productFamilyRef, storageLocationRef } from "@/models/types";
import { getCategoryIconClass } from "@/shared/categoryIcons";
import { formatTicksAsDate } from "@/shared/dateFormat";
import LoadingTargets from "@/shared/loadingTargets";
import AppRoutes from "@/shared/routes";
import { StockValidationLevel, validateStockLevel } from "@/shared/stockValidation";
import { UnitOfMeasureLabels } from "@/shared/unitOfMeasureLabels";
import BarcodeScannerDialog from "./barcodeScannerDialog";
import ProductSelectionDialog from "./productSelectionDialog";
import RestockPanel from "./restockPanel";
import WithdrawStockDialog from "./withdrawStockDialog";
import styles from "./home.module.scss";

const getProductKey = (product: Product): number => product.id;

const Home: React.FC = () => {
    const dispatch = store.useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const locationState = location.state as { selectedCategoryId?: number } | null;
    const restoredCategoryId = locationState?.selectedCategoryId;
    const categories = store.useAppSelector((state) => state.categories.categories);
    const familyById = store.useAppSelector(store.ProductFamilies.Selectors.selectProductFamilyMap);
    const products = store.useAppSelector((state) => state.products.products);
    const storageLocations = store.useAppSelector((state) => state.storageLocations.storageLocations);
    const trackedProductsByProductId = store.useAppSelector(store.TrackedProducts.Selectors.selectTrackedProductsByProductId);
    const trackedQuantityByProductId = store.useAppSelector(store.TrackedProducts.Selectors.selectTrackedQuantityByProductId);
    const familyAggregates = store.useAppSelector(store.TrackedProducts.Selectors.selectStockAggregatesByFamilyId);

    const [selectedCategoryId, setSelectedCategoryId] = useState<CategoryRef | null>(null);
    const productExpansion = useRowExpansion<Product>(getProductKey);
    const [expandedTrackedRows, setExpandedTrackedRows] = useState<TrackedProduct[]>([]);
    const [isWithdrawDialogVisible, setIsWithdrawDialogVisible] = useState(false);
    const [withdrawTrackedProduct, setWithdrawTrackedProduct] = useState<TrackedProduct | null>(null);
    const [isScannerVisible, setIsScannerVisible] = useState(false);
    const [matchedProducts, setMatchedProducts] = useState<Product[]>([]);
    const [isProductSelectionVisible, setIsProductSelectionVisible] = useState(false);
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [shouldShowEmpty, setShouldShowEmpty] = useState(false);

    useEffect(() => {
        dispatch(store.Categories.Actions.fetchCategories());
        dispatch(store.ProductFamilies.Actions.fetchProductFamilies());
        dispatch(store.Products.Actions.fetchProducts());
        dispatch(store.StorageLocations.Actions.fetchStorageLocations());
        dispatch(store.TrackedProducts.Actions.fetchTrackedProducts());
    }, [dispatch]);

    useEffect(() => {
        if (selectedCategoryId == null && categories.length > 0) {
            const match = restoredCategoryId != null ? categories.find((c) => c.id === restoredCategoryId) : null;
            setSelectedCategoryId(match != null ? match.id : categories[0].id);
        }
    }, [categories, restoredCategoryId, selectedCategoryId]);

    const filteredProducts = useMemo(() => {
        const normalizedFilter = globalFilterValue.trim().toLowerCase();
        return products.filter((p) => {
            if (p.categoryId !== selectedCategoryId) {
                return false;
            }

            if (!shouldShowEmpty && (trackedProductsByProductId.get(p.id) ?? []).length === 0) {
                return false;
            }

            if (normalizedFilter === "") {
                return true;
            }

            const searchableContent = [
                p.name,
                p.manufacturer ?? "",
                p.description ?? "",
                p.barCode ?? "",
            ].join(" ").toLowerCase();

            return searchableContent.includes(normalizedFilter);
        });
    }, [products, selectedCategoryId, globalFilterValue, shouldShowEmpty, trackedProductsByProductId]);

    // Subheader grouping requires the rows to be contiguous per family.
    const groupedProducts = useMemo(() => {
        return [...filteredProducts].sort((a, b) => {
            if (a.familyId !== b.familyId) {
                return Number(a.familyId) - Number(b.familyId);
            }
            return a.name.localeCompare(b.name);
        });
    }, [filteredProducts]);

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
                void goTo(navigate, AppRoutes.AddProduct, undefined, { barCode: barcode, familyId: productFamilyRef.default(), selectedCategoryId: selectedCategoryId ?? 0 });
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

    const onGlobalFilterChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setGlobalFilterValue(event.target.value);
    };

    const handleAddProductForFamily = (family: ProductFamily): void => {
        void goTo(navigate, AppRoutes.AddProduct, undefined, {
            barCode: "",
            familyId: family.id,
            selectedCategoryId: selectedCategoryId ?? 0,
        });
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
        return <span>{formatTicksAsDate(tp.expirationDate)}</span>;
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

    const familyHeaderTemplate = (product: Product): React.ReactNode => {
        const family = familyById.get(product.familyId);
        if (family == null) {
            return null;
        }
        const aggregate = familyAggregates.get(family.id) ?? { count: 0, trackedProducts: [] };
        const uomLabel = UnitOfMeasureLabels[family.unitOfMeasure];
        const validation = validateStockLevel(aggregate.count, family.minimumStockLevel, aggregate.trackedProducts);
        const tooltipId = `family-tooltip-${String(family.id)}`;

        return (
            <div className={styles.familyGroupHeader} data-test_id="Home__Family_Header">
                <span className={styles.familyGroupName}>{family.name}</span>
                <span className={styles.familyGroupMeta}>
                    {family.minimumStockLevel > 0
                        ? `${aggregate.count} of ${family.minimumStockLevel} ${uomLabel}`
                        : `${aggregate.count} ${uomLabel}`}
                </span>
                {validation.level === StockValidationLevel.Danger && (
                    <>
                        <Chip label="❗" className={`${styles.stockChipDanger} ${tooltipId}`} data-test_id="Home__Family_Stock_Attention" />
                        <Tooltip target={`.${tooltipId}`} position="top">
                            <ul style={{ margin: 0, paddingLeft: "1rem" }}>
                                {validation.reasons.map((reason, i) => <li key={i}>{reason}</li>)}
                            </ul>
                        </Tooltip>
                    </>
                )}
                {validation.level === StockValidationLevel.Warning && (
                    <>
                        <Chip label="⚠️" className={`${styles.stockChipWarning} ${tooltipId}`} data-test_id="Home__Family_Stock_Warning" />
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

    const rowExpansionTemplate = (product: Product): React.ReactNode => {
        const productTrackedProducts = [...(trackedProductsByProductId.get(product.id) ?? [])]
            .sort((a, b) => {
                if (a.expirationDate == null && b.expirationDate == null) return 0;
                if (a.expirationDate == null) return -1;
                if (b.expirationDate == null) return 1;
                return a.expirationDate - b.expirationDate;
            });
        const family = familyById.get(product.familyId);
        const uomLabel = family != null ? UnitOfMeasureLabels[family.unitOfMeasure] : "";

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
                    onClick={() => productExpansion.toggleRow(product)}
                >
                    {label}
                </span>
            </div>
        );
    };

    const stockLevelTemplate = (product: Product): React.ReactNode => {
        const count = trackedQuantityByProductId.get(product.id) ?? product.trackedProductsCount;
        const family = familyById.get(product.familyId);
        const uomLabel = family != null ? UnitOfMeasureLabels[family.unitOfMeasure] : "";
        return <span className={styles.stockCell}>{count} {uomLabel}</span>;
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

    const renderHeader = (): React.ReactNode => {
        return (
            <div className={styles.tableHeader}>
                <div className={styles.showEmptyToggle}>
                    <label htmlFor="showEmptySwitch">Show empty</label>
                    <InputSwitch
                        inputId="showEmptySwitch"
                        checked={shouldShowEmpty}
                        data-test_id="Home__Show_Empty_Switch"
                        onChange={(e) => setShouldShowEmpty(e.value)}
                    />
                </div>
                <IconField iconPosition="left" className={styles.searchField}>
                    <InputIcon className="pi pi-search" />
                    <InputText
                        value={globalFilterValue}
                        onChange={onGlobalFilterChange}
                        placeholder="Search products"
                        data-test_id="Home__Products_Search"
                    />
                </IconField>
            </div>
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
                        onClick={() => void goTo(navigate, AppRoutes.AddProduct, undefined, { barCode: "", familyId: productFamilyRef.default(), selectedCategoryId: selectedCategoryId ?? 0 })}
                    />
                </div>
            </div>

            <RestockPanel categoryId={selectedCategoryId} onAddProduct={handleAddProductForFamily} />

            <DataTable
                value={groupedProducts}
                header={renderHeader()}
                expandedRows={productExpansion.expandedRows}
                rowExpansionTemplate={rowExpansionTemplate}
                rowGroupMode="subheader"
                groupRowsBy="familyId"
                sortMode="single"
                sortField="familyId"
                sortOrder={1}
                rowGroupHeaderTemplate={familyHeaderTemplate}
                dataKey="id"
                data-test_id="Home__Products_Table"
            >
                <Column body={productExpansion.expanderTemplate} className={styles.expanderColumn} />
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
