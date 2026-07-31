import React, { useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { goTo, translateErrorsToForm } from "@hwndmaster/atom-react-core";
import { inputDateToTicks } from "@hwndmaster/atom-web-core";
import { toastService } from "@hwndmaster/atom-react-prime";
import { Button } from "@/primereact";
import * as store from "@/store";
import { productRef, storageLocationRef } from "@/models/types";
import AppRoutes from "@/shared/routes";
import { TrackedProductFormFields } from "@/components/trackedProductForm";
import { trackedProductSchema, TrackedProductSchemaData } from "@/schemas/trackedProductSchema";
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

    const form = useForm<TrackedProductSchemaData>({
        resolver: zodResolver(trackedProductSchema),
        defaultValues: {
            quantity: 1,
            storageLocationId: storageLocationRef.default(),
            expirationDate: "",
            notes: undefined,
        },
    });

    const handleSubmit = (data: TrackedProductSchemaData): void => {
        form.clearErrors();
        dispatch(store.TrackedProducts.Actions.createTrackedProduct(
            {
                productId: productRef(productIdValue),
                storageLocationId: data.storageLocationId,
                quantity: data.quantity,
                expirationDate: inputDateToTicks(data.expirationDate),
                notes: data.notes
            },
            translateErrorsToForm(form),
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
