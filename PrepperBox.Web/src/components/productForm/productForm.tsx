import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Divider } from "@/primereact";
import * as store from "@/store";
import { categoryRef } from "@/models/types";
import Product from "@/models/product";
import { UnitOfMeasure } from "@/models/unitOfMeasure";
import { UnitOfMeasureOptions } from "@/shared/unitOfMeasureLabels";
import { FormInputText, FormInputNumber, FormDropdown, FormInputTextarea } from "@/components/forms";
import { TrackedProductFormFields, useTrackedProductForm } from "@/components/trackedProductForm";
import type { TrackedProductFormData } from "@/components/trackedProductForm";
import { productFormSchema, ProductFormData } from "./productForm.schema";
import styles from "./productForm.module.scss";

interface PendingTrackedProduct {
    key: number;
    data: TrackedProductFormData;
}

interface ProductFormProps {
    product?: Product;
    submitLabel: string;
    onSubmit: (data: ProductFormData, pendingTrackedProducts: TrackedProductFormData[]) => void;
    onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, submitLabel, onSubmit, onCancel }) => {
    const dispatch = store.useAppDispatch();
    const categories = store.useAppSelector((state) => state.categories.categories);
    const [pendingTrackedProducts, setPendingTrackedProducts] = useState<PendingTrackedProduct[]>([]);
    const [isShowingTrackedProductForm, setIsShowingTrackedProductForm] = useState(false);
    const [nextKey, setNextKey] = useState(1);

    const trackedProductForm = useTrackedProductForm();

    useEffect(() => {
        dispatch(store.Categories.Actions.fetchCategories());
        dispatch(store.StorageLocations.Actions.fetchStorageLocations());
    }, [dispatch]);

    const form = useForm<ProductFormData>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            name: product?.name ?? "",
            description: product?.description ?? undefined,
            categoryId: product?.categoryId ?? categoryRef.default(),
            manufacturer: product?.manufacturer ?? undefined,
            barCode: product?.barCode ?? undefined,
            unitOfMeasure: product?.unitOfMeasure ?? UnitOfMeasure.Piece,
            minimumStockLevel: product?.minimumStockLevel ?? 0,
        },
    });

    const handleAddTrackedProduct = (data: TrackedProductFormData): void => {
        setPendingTrackedProducts((prev) => [...prev, { key: nextKey, data }]);
        setNextKey((k) => k + 1);
        setIsShowingTrackedProductForm(false);
        trackedProductForm.reset();
    };

    const handleRemoveTrackedProduct = (key: number): void => {
        setPendingTrackedProducts((prev) => prev.filter((tp) => tp.key !== key));
    };

    const handleSubmit = form.handleSubmit((data) => {
        onSubmit(data, pendingTrackedProducts.map((tp) => tp.data));
    });

    return (
        <form onSubmit={(e) => void handleSubmit(e)} className={styles.form} data-test_id="ProductForm__Form">
            <div className={styles.firstRow}>
                <FormInputText name="name" form={form} label="Name" />
                <FormInputText name="manufacturer" form={form} label="Manufacturer" />
            </div>
            <div className={styles.row}>
                <FormInputText name="barCode" form={form} label="Bar Code" />
                <FormDropdown
                    name="categoryId"
                    form={form}
                    label="Category"
                    options={categories}
                    optionLabel="name"
                    optionValue="id"
                />
                <FormInputNumber name="minimumStockLevel" form={form} label="Minimum Stock Level" />
                <FormDropdown
                    name="unitOfMeasure"
                    form={form}
                    label="Unit of Measure"
                    options={UnitOfMeasureOptions}
                    optionLabel="label"
                    optionValue="value"
                />
            </div>
            <div className={styles.row}>
                <FormInputTextarea name="description" form={form} label="Description" inputProps={{ rows: 5 }} />
            </div>

            <Divider />

            <h3>Tracked Products</h3>
            {pendingTrackedProducts.length > 0 && (
                <ul className={styles.trackedProductList} data-test_id="ProductForm__TrackedProduct_List">
                    {pendingTrackedProducts.map((tp) => (
                        <li key={tp.key} className={styles.trackedProductItem}>
                            <span>
                                Qty: {tp.data.quantity}
                                {tp.data.expirationDate != null && tp.data.expirationDate !== "" ? `, Exp: ${new Date(tp.data.expirationDate).toDateString()}` : ""}
                                {tp.data.notes != null && tp.data.notes !== "" ? `, Notes: ${tp.data.notes}` : ""}
                            </span>
                            <Button
                                type="button"
                                icon="pi pi-times"
                                severity="danger"
                                text
                                rounded
                                data-test_id="ProductForm__Remove_TrackedProduct"
                                onClick={() => handleRemoveTrackedProduct(tp.key)}
                            />
                        </li>
                    ))}
                </ul>
            )}

            {isShowingTrackedProductForm ? (
                <div data-test_id="ProductForm__TrackedProductForm">
                    <TrackedProductFormFields form={trackedProductForm} />
                    <div className={styles.actions}>
                        <Button
                            type="button"
                            label="Add"
                            data-test_id="ProductForm__Add_TrackedProduct"
                            onClick={() => void trackedProductForm.handleSubmit(handleAddTrackedProduct)()}
                        />
                        <Button
                            type="button"
                            label="Cancel"
                            severity="secondary"
                            outlined
                            data-test_id="ProductForm__Cancel_TrackedProduct"
                            onClick={() => {
                                setIsShowingTrackedProductForm(false);
                                trackedProductForm.reset();
                            }}
                        />
                    </div>
                </div>
            ) : (
                <Button
                    type="button"
                    label="Add Tracked Product"
                    icon="pi pi-plus"
                    severity="secondary"
                    text
                    data-test_id="ProductForm__Show_TrackedProductForm"
                    onClick={() => setIsShowingTrackedProductForm(true)}
                />
            )}

            <Divider />

            <div className={styles.actions}>
                <Button type="submit" label={submitLabel} data-test_id="ProductForm__Submit" />
                <Button
                    type="button"
                    label="Cancel"
                    severity="secondary"
                    outlined
                    data-test_id="ProductForm__Cancel"
                    onClick={onCancel}
                />
            </div>
        </form>
    );
};

export type { ProductFormData, ProductFormProps };
export default ProductForm;
