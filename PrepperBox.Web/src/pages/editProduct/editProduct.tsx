import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as store from "@/store";
import { productRef } from "@/models/types";
import AppRoutes, { goTo } from "@/shared/routes";
import { inputDateToTicks } from "@/shared/helper";
import { toastService } from "@/shared/ui/toastService";
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

    const handleCancel = (): void => {
        void goTo(navigate, AppRoutes.Default);
    };

    if (product == null) {
        return <div className={styles.pageContent}>Product not found.</div>;
    }

    return (
        <div className={styles.pageContent} data-test_id="EditProduct__Page">
            <h2>Edit Product</h2>
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
