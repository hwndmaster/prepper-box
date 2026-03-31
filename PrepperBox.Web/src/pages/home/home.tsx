import React, { useEffect, useMemo, useState } from "react";
import { confirmDialog } from "primereact/confirmdialog";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import * as store from "@/store";
import Product from "@/models/product";
import TrackedProduct from "@/models/trackedProduct";
import { CategoryRef, ProductRef } from "@/models/types";
import LoadingTargets from "@/shared/loadingTargets";
import { LoadingSpinner } from "@/components/loadingSpinner";
import styles from "./home.module.scss";


const Home: React.FC = () => {
    const dispatch = store.useAppDispatch();
    const categories = store.useAppSelector((state) => state.categories.categories);
    const products = store.useAppSelector((state) => state.products.products);
    const trackedProducts = store.useAppSelector((state) => state.trackedProducts.trackedProducts);

    const [selectedCategoryId, setSelectedCategoryId] = useState<CategoryRef | null>(null);
    const [expandedRows, setExpandedRows] = useState<Product[]>([]);

    useEffect(() => {
        dispatch(store.Categories.Actions.fetchCategories());
        dispatch(store.Products.Actions.fetchProducts());
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

    const handleDeleteTrackedProduct = (tp: TrackedProduct): void => {
        confirmDialog({
            message: "Are you sure you want to delete this tracked product?",
            header: "Confirm Delete",
            icon: "pi pi-exclamation-triangle",
            accept: () => {
                dispatch(store.TrackedProducts.Actions.deleteTrackedProduct(tp.id));
            },
        });
    };

    const expirationDateTemplate = (tp: TrackedProduct): React.ReactNode => {
        if (tp.expirationDate == null) {
            return <span>—</span>;
        }
        return <span>{tp.expirationDate.toLocaleDateString()}</span>;
    };

    const deleteActionTemplate = (tp: TrackedProduct): React.ReactNode => {
        return (
            <Button
                icon="pi pi-trash"
                severity="danger"
                text
                rounded
                data-test_id="Home__Delete_TrackedProduct"
                onClick={() => handleDeleteTrackedProduct(tp)}
            />
        );
    };

    const rowExpansionTemplate = (product: Product): React.ReactNode => {
        const productTrackedProducts = trackedProductsByProductId.get(product.id) ?? [];
        return (
            <div className={styles.expandableContent}>
                <DataTable value={productTrackedProducts} data-test_id="Home__TrackedProducts_Table">
                    <Column field="expirationDate" header="Expiration Date" body={expirationDateTemplate} />
                    <Column header="Actions" body={deleteActionTemplate} className={styles.actionColumn} />
                </DataTable>
            </div>
        );
    };

    return (
        <LoadingSpinner target={LoadingTargets.ActiveView}>
            <div className={styles.categoryTabs} data-test_id="Home__Category_Tabs">
                {categories.map((category) => (
                    <Button
                        key={category.id}
                        label={category.name}
                        severity={category.id === selectedCategoryId ? undefined : "secondary"}
                        outlined={category.id !== selectedCategoryId}
                        data-test_id="Home__Category_Button"
                        onClick={() => setSelectedCategoryId(category.id)}
                    />
                ))}
            </div>

            <DataTable
                value={filteredProducts}
                expandedRows={expandedRows}
                onRowToggle={(e) => setExpandedRows(e.data as Product[])}
                rowExpansionTemplate={rowExpansionTemplate}
                dataKey="id"
                data-test_id="Home__Products_Table"
            >
                <Column expander className={styles.expanderColumn} />
                <Column field="name" header="Name" />
                <Column field="manufacturer" header="Manufacturer" />
                <Column field="trackedProductsCount" header="Tracked Products" />
            </DataTable>
        </LoadingSpinner>
    );
};

export default Home;
