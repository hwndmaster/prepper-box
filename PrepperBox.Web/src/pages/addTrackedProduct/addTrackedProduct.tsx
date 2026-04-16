import React, { useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/primereact";
import * as store from "@/store";
import { productRef, storageLocationRef } from "@/models/types";
import AppRoutes, { goTo } from "@/shared/routes";
import { inputDateToTicks } from "@/shared/helper";
import { toastService } from "@/shared/ui/toastService";
import { TrackedProductFormFields, trackedProductFormSchema } from "@/components/trackedProductForm";
import type { TrackedProductFormData } from "@/components/trackedProductForm";
import styles from "./addTrackedProduct.module.scss";

const AddTrackedProduct: React.FC = () => {
    const dispatch = store.useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const locationState = location.state as { selectedCategoryId?: number } | null;
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

    const form = useForm<TrackedProductFormData>({
        resolver: zodResolver(trackedProductFormSchema),
        defaultValues: {
            quantity: 1,
            storageLocationId: storageLocationRef.default(),
            expirationDate: "",
            notes: undefined,
        },
    });

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
                void goTo(navigate, AppRoutes.Default, undefined, { selectedCategoryId: locationState?.selectedCategoryId ?? 0 });
            }
        ));
    };

    const handleCancel = (): void => {
        void goTo(navigate, AppRoutes.Default, undefined, { selectedCategoryId: locationState?.selectedCategoryId ?? 0 });
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
