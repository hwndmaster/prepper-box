import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { translateErrorsToForm, FormValidationErrors } from "@hwndmaster/atom-react-core";
import { toastService, FormInputText, FormDropdown, FormInputTextarea } from "@hwndmaster/atom-react-prime";
import { Button, Divider } from "@/primereact";
import * as store from "@/store";
import { categoryRef, productFamilyRef } from "@/models/types";
import Product from "@/models/product";
import OpenFoodFactsProduct from "@/models/openFoodFactsProduct";

import { TrackedProductFormFields, useTrackedProductForm } from "@/components/trackedProductForm";
import { formatDate } from "@/shared/dateFormat";
import { selectProductImageUrl } from "@/shared/productImage";
import { productSchema, ProductSchemaData } from "@/schemas/productSchema";
import type { TrackedProductSchemaData } from "@/schemas/trackedProductSchema";
import BarCodeSuggestions from "./BarCodeSuggestions";
import styles from "./productForm.module.scss";

interface PendingTrackedProduct {
    key: number;
    data: TrackedProductSchemaData;
}

interface ProductFormProps {
    product?: Product;
    initialBarCode?: string;
    submitLabel: string;
    onSubmit: (data: ProductSchemaData, pendingTrackedProducts: TrackedProductSchemaData[], translateErrors: (errors: FormValidationErrors<ProductSchemaData>) => void) => void;
    onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, initialBarCode, submitLabel, onSubmit, onCancel }) => {
    const dispatch = store.useAppDispatch();
    const categories = store.useAppSelector((state) => state.categories.categories);
    const productFamilies = store.useAppSelector((state) => state.productFamilies.productFamilies);
    const foodCategory = store.useAppSelector((state) => store.Categories.Selectors.selectCategoryByName(state, "Food"));
    const [pendingTrackedProducts, setPendingTrackedProducts] = useState<PendingTrackedProduct[]>([]);
    const [isShowingTrackedProductForm, setIsShowingTrackedProductForm] = useState(false);
    const [nextKey, setNextKey] = useState(1);
    const [barCodeSuggestions, setBarCodeSuggestions] = useState<OpenFoodFactsProduct[]>([]);
    const [isLoadingBarCodeSuggestions, setIsLoadingBarCodeSuggestions] = useState(false);

    const trackedProductForm = useTrackedProductForm();

    useEffect(() => {
        dispatch(store.Categories.Actions.fetchCategories());
        dispatch(store.ProductFamilies.Actions.fetchProductFamilies());
        dispatch(store.StorageLocations.Actions.fetchStorageLocations());
    }, [dispatch]);

    const form = useForm<ProductSchemaData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: product?.name ?? "",
            description: product?.description ?? undefined,
            categoryId: product?.categoryId ?? categoryRef.default(),
            familyId: product?.familyId ?? productFamilyRef.default(),
            manufacturer: product?.manufacturer ?? undefined,
            barCode: product?.barCode ?? initialBarCode ?? undefined,
            imageUrl: product?.imageUrl ?? undefined,
            imageSmallUrl: product?.imageSmallUrl ?? undefined,
        },
    });

    const selectedCategoryId = form.watch("categoryId");
    const selectedFamilyId = form.watch("familyId");

    // Watched so the preview follows the URLs a picked bar code suggestion writes into the form.
    const productImageUrl = selectProductImageUrl({
        imageUrl: form.watch("imageUrl"),
        imageSmallUrl: form.watch("imageSmallUrl"),
    });

    // Families belong to a category, so only offer those under the selected category, listed by name.
    const familyOptions = useMemo(
        () => productFamilies
            .filter((family) => family.categoryId === selectedCategoryId)
            .sort((a, b) => a.name.localeCompare(b.name)),
        [productFamilies, selectedCategoryId]
    );

    // Clear the selected family whenever it no longer belongs to the chosen category.
    useEffect(() => {
        if (selectedFamilyId !== productFamilyRef.default() && !familyOptions.some((family) => family.id === selectedFamilyId)) {
            form.setValue("familyId", productFamilyRef.default());
        }
    }, [familyOptions, selectedFamilyId, form]);

    const fetchBarCodeSuggestions = (barCode: string): void => {
        if (barCode.trim() === "") {
            return;
        }
        setIsLoadingBarCodeSuggestions(true);
        setBarCodeSuggestions([]);
        dispatch(store.OpenFoodFacts.Actions.searchByBarCode(barCode, (results) => {
            setBarCodeSuggestions(results ?? []);
            setIsLoadingBarCodeSuggestions(false);
        }, () => {
            setIsLoadingBarCodeSuggestions(false);
        }));
    };

    useEffect(() => {
        if (initialBarCode != null && initialBarCode.trim() !== "") {
            fetchBarCodeSuggestions(initialBarCode);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleBarCodeBlur = (value: string): void => {
        fetchBarCodeSuggestions(value);
    };

    const handleSelectSuggestion = (suggestion: OpenFoodFactsProduct): void => {
        if (suggestion.productName != null) {
            form.setValue("name", suggestion.productName, { shouldValidate: true });
        }
        if (suggestion.brands != null) {
            form.setValue("manufacturer", suggestion.brands);
        }
        if (foodCategory != null) {
            form.setValue("categoryId", foodCategory.id);
            // Best-effort: pre-select a Food family whose unit matches the scanned quantity,
            // preferring the catch-all "Misc (...)" family. The user can still change it.
            if (suggestion.unitOfMeasure != null) {
                const candidates = productFamilies.filter(
                    (family) => family.categoryId === foodCategory.id && family.unitOfMeasure === suggestion.unitOfMeasure
                );
                const match = candidates.find((family) => family.name.startsWith("Misc")) ?? candidates[0];
                if (match != null) {
                    form.setValue("familyId", match.id, { shouldValidate: true });
                }
            }
        }
        form.setValue("imageUrl", suggestion.imageUrl);
        form.setValue("imageSmallUrl", suggestion.imageSmallUrl);
        if (suggestion.quantity != null) {
            trackedProductForm.setValue("quantity", suggestion.quantity);
            setIsShowingTrackedProductForm(true);
        }
        setBarCodeSuggestions([]);
    };

    const handleAddTrackedProduct = (data: TrackedProductSchemaData): void => {
        setPendingTrackedProducts((prev) => [...prev, { key: nextKey, data }]);
        setNextKey((k) => k + 1);
        setIsShowingTrackedProductForm(false);
        trackedProductForm.reset();
    };

    const handleRemoveTrackedProduct = (key: number): void => {
        setPendingTrackedProducts((prev) => prev.filter((tp) => tp.key !== key));
    };

    const handleSubmit = form.handleSubmit((data) => {
        if (isShowingTrackedProductForm) {
            toastService.showWarn("Please confirm or cancel the pending tracked product before submitting.");
            return;
        }
        form.clearErrors();
        onSubmit(data, pendingTrackedProducts.map((tp) => tp.data), translateErrorsToForm(form));
    });

    return (
        <form onSubmit={(e) => void handleSubmit(e)} className={styles.form} data-test_id="ProductForm__Form">
            <div className={styles.firstRow}>
                <FormInputText name="name" form={form} label="Name" />
            </div>
            <div className={styles.row}>
                <FormInputText name="manufacturer" form={form} label="Manufacturer" />
            </div>
            <div className={productImageUrl != null ? styles.fieldsWithImage : undefined}>
                <div className={styles.row}>
                    <div className={styles.barCodeWrapper}>
                        <FormInputText name="barCode" form={form} label="Bar Code" onBlur={handleBarCodeBlur} />
                        <BarCodeSuggestions
                            suggestions={barCodeSuggestions}
                            isLoading={isLoadingBarCodeSuggestions}
                            onSelect={handleSelectSuggestion}
                        />
                    </div>
                    <FormDropdown
                        name="categoryId"
                        form={form}
                        label="Category"
                        options={categories}
                        optionLabel="name"
                        optionValue="id"
                    />
                    <FormDropdown
                        name="familyId"
                        form={form}
                        label="Family"
                        options={familyOptions}
                        optionLabel="name"
                        optionValue="id"
                    />
                </div>
                {productImageUrl != null && (
                    <div className={styles.productImage}>
                        <img
                            src={productImageUrl}
                            alt={product?.name ?? "Product image"}
                            data-test_id="ProductForm__Product_Image"
                        />
                    </div>
                )}
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
                                {tp.data.expirationDate != null && tp.data.expirationDate !== "" ? `, Exp: ${formatDate(new Date(tp.data.expirationDate))}` : ""}
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

export type { ProductFormProps };
export default ProductForm;
