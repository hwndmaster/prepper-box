import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as store from "@/store";
import { productRef } from "@/models/types";
import AppRoutes, { goTo } from "@/shared/routes";
import { inputDateToTicks } from "@/shared/helper";
import { toastService } from "@/shared/ui/toastService";
import { Button, confirmDialog } from "@/primereact";
import { ProductForm } from "@/components/productForm";
import type { ProductFormData } from "@/components/productForm";
import type { TrackedProductFormData } from "@/components/trackedProductForm";
import styles from "./editProduct.module.scss";

const EditProduct: React.FC = () => {
    const dispatch = store.useAppDispatch();
    const navigate = useNavigate();
    const { productId } = useParams<{ productId: string }>();
    const products = store.useAppSelector((state) => state.products.products);

    const product = useMemo(
        () => products.find((p) => p.id === productRef(Number(productId))),
        [products, productId]
    );

    const handleSubmit = (data: ProductFormData, pendingTrackedProducts: TrackedProductFormData[]): void => {
        if (product == null) {
            return;
        }

        dispatch(store.Products.Actions.updateProduct(
            {
                ...product,
                name: data.name,
                description: data.description,
                categoryId: data.categoryId,
                manufacturer: data.manufacturer,
                barCode: data.barCode,
                imageUrl: data.imageUrl,
                imageSmallUrl: data.imageSmallUrl,
                unitOfMeasure: data.unitOfMeasure,
                minimumStockLevel: data.minimumStockLevel,
            },
            (savedProductId) => {
                if (savedProductId != null && pendingTrackedProducts.length > 0) {
                    for (const tp of pendingTrackedProducts) {
                        dispatch(store.TrackedProducts.Actions.createTrackedProduct({
                            productId: savedProductId,
                            storageLocationId: tp.storageLocationId,
                            quantity: tp.quantity,
                            expirationDate: inputDateToTicks(tp.expirationDate),
                            notes: tp.notes
                        }));
                    }
                }
                toastService.showSuccess("Product updated successfully.");
                void goTo(navigate, AppRoutes.Default);
            }
        ));
    };

    const handleDelete = (): void => {
        if (product == null) {
            return;
        }
        confirmDialog({
            message: "Are you sure you want to delete this product? This action cannot be undone.",
            header: "Confirm Delete",
            icon: "pi pi-exclamation-triangle",
            acceptClassName: "p-button-danger",
            accept: () => {
                dispatch(store.Products.Actions.deleteProduct(product.id, () => {
                    toastService.showSuccess("Product deleted successfully.");
                    void goTo(navigate, AppRoutes.Default);
                }));
            },
        });
    };

    const handleCancel = (): void => {
        void goTo(navigate, AppRoutes.Default);
    };

    if (product == null) {
        return <div className={styles.pageContent}>Product not found.</div>;
    }

    return (
        <div className={styles.pageContent} data-test_id="EditProduct__Page">
            <div className={styles.pageHeader}>
                <h2>Edit Product</h2>
                <Button
                    icon="pi pi-trash"
                    label="Delete Product"
                    severity="danger"
                    outlined
                    data-test_id="EditProduct__Delete_Button"
                    onClick={handleDelete}
                />
            </div>
            <ProductForm
                product={product}
                submitLabel="Save Product"
                onSubmit={handleSubmit}
                onCancel={handleCancel}
            />
        </div>
    );
};

export default EditProduct;
