import React from "react";
import { useLocation, useNavigate } from "react-router";
import { goTo, FormValidationErrors } from "@hwndmaster/atom-react-core";
import { inputDateToTicks } from "@hwndmaster/atom-web-core";
import { toastService } from "@hwndmaster/atom-react-prime";
import * as store from "@/store";
import AppRoutes from "@/shared/routes";
import { ProductForm } from "@/components/productForm";
import type { ProductSchemaData } from "@/schemas/productSchema";
import type { TrackedProductSchemaData } from "@/schemas/trackedProductSchema";
import styles from "./addProduct.module.scss";

interface AddProductLocationState {
    barCode?: string;
    selectedCategoryId?: number;
}

const AddProduct: React.FC = () => {
    const dispatch = store.useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const locationState = location.state as AddProductLocationState | null;

    const handleSubmit = (data: ProductSchemaData, pendingTrackedProducts: TrackedProductSchemaData[], translateErrors: (errors: FormValidationErrors<ProductSchemaData>) => void): void => {
        dispatch(store.Products.Actions.createProduct(
            {
                name: data.name,
                description: data.description,
                familyId: data.familyId,
                manufacturer: data.manufacturer,
                barCode: data.barCode,
                imageUrl: data.imageUrl,
                imageSmallUrl: data.imageSmallUrl
            },
            translateErrors,
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
                void goTo(navigate, AppRoutes.Default, undefined, { selectedCategoryId: locationState?.selectedCategoryId ?? 0 });
            }
        ));
    };

    const handleCancel = (): void => {
        void goTo(navigate, AppRoutes.Default, undefined, { selectedCategoryId: locationState?.selectedCategoryId ?? 0 });
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
