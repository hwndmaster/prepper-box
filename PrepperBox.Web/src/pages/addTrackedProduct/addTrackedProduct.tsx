import React, { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "primereact/button";
import * as store from "@/store";
import { productRef } from "@/models/types";
import AppRoutes, { goTo } from "@/shared/routes";
import { inputDateToTicks } from "@/shared/helper";
import { toastService } from "@/shared/ui/toastService";
import { TrackedProductFormFields, useTrackedProductForm } from "@/components/trackedProductForm";
import type { TrackedProductFormData } from "@/components/trackedProductForm";
import styles from "./addTrackedProduct.module.scss";

const AddTrackedProduct: React.FC = () => {
    const dispatch = store.useAppDispatch();
    const navigate = useNavigate();
    const { productId: productIdParam } = useParams<{ productId: string }>();
    const products = store.useAppSelector((state) => state.products.products);

    const productIdValue = Number(productIdParam);
    const product = useMemo(
        () => products.find((p) => p.id === productRef(productIdValue)),
        [products, productIdValue]
    );

    useEffect(() => {
        dispatch(store.StorageLocations.Actions.fetchStorageLocations());
    }, [dispatch]);

    const form = useTrackedProductForm();

    const handleSubmit = (data: TrackedProductFormData): void => {
        dispatch(store.TrackedProducts.Actions.createTrackedProduct(
            {
                productId: productRef(productIdValue),
                storageLocationId: data.storageLocationId,
                quantity: data.quantity,
                expirationDate: inputDateToTicks(data.expirationDate),
                notes: data.notes
            },
            () => {
                toastService.showSuccess("Tracked product added successfully.");
                void goTo(navigate, AppRoutes.Default);
            }
        ));
    };

    const handleCancel = (): void => {
        void goTo(navigate, AppRoutes.Default);
    };

    return (
        <div className={styles.pageContent} data-test_id="AddTrackedProduct__Page">
            <h2>Add Tracked Product{product != null ? ` for ${product.name}` : ""}</h2>
            <form onSubmit={(e) => void form.handleSubmit(handleSubmit)(e)} className={styles.form} data-test_id="AddTrackedProduct__Form">
                <TrackedProductFormFields form={form} />
                <div className={styles.actions}>
                    <Button type="submit" label="Save" data-test_id="AddTrackedProduct__Save" />
                    <Button
                        type="button"
                        label="Cancel"
                        severity="secondary"
                        outlined
                        data-test_id="AddTrackedProduct__Cancel"
                        onClick={handleCancel}
                    />
                </div>
            </form>
        </div>
    );
};

export default AddTrackedProduct;
