import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as store from "@/store";
import AppRoutes, { goTo } from "@/shared/routes";
import { inputDateToTicks } from "@/shared/helper";
import { toastService } from "@/shared/ui/toastService";
import { ProductForm } from "@/components/productForm";
import type { ProductFormData } from "@/components/productForm";
import type { TrackedProductFormData } from "@/components/trackedProductForm";
import styles from "./addProduct.module.scss";

interface AddProductLocationState {
    barCode?: string;
}

const AddProduct: React.FC = () => {
    const dispatch = store.useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const locationState = location.state as AddProductLocationState | null;

    const handleSubmit = (data: ProductFormData, pendingTrackedProducts: TrackedProductFormData[]): void => {
        dispatch(store.Products.Actions.createProduct(
            {
                name: data.name,
                description: data.description,
                categoryId: data.categoryId,
                manufacturer: data.manufacturer,
                barCode: data.barCode,
                imageUrl: data.imageUrl,
                imageSmallUrl: data.imageSmallUrl,
                unitOfMeasure: data.unitOfMeasure,
                minimumStockLevel: data.minimumStockLevel
            },
            (createdProductId) => {
                if (createdProductId != null && pendingTrackedProducts.length > 0) {
                    for (const tp of pendingTrackedProducts) {
                        dispatch(store.TrackedProducts.Actions.createTrackedProduct({
                            productId: createdProductId,
                            storageLocationId: tp.storageLocationId,
                            quantity: tp.quantity,
                            expirationDate: inputDateToTicks(tp.expirationDate),
                            notes: tp.notes
                        }));
                    }
                }
                toastService.showSuccess("Product created successfully.");
                void goTo(navigate, AppRoutes.Default);
            }
        ));
    };

    const handleCancel = (): void => {
        void goTo(navigate, AppRoutes.Default);
    };

    return (
        <div className={styles.pageContent} data-test_id="AddProduct__Page">
            <h2>Add Product</h2>
            <ProductForm
                submitLabel="Create Product"
                initialBarCode={locationState?.barCode}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
            />
        </div>
    );
};

export default AddProduct;
