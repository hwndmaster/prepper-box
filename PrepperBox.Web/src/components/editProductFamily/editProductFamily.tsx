import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { translateErrorsToForm, FormValidationErrors } from "@hwndmaster/atom-react-core";
import { FormInputText, FormInputNumber, FormDropdown } from "@hwndmaster/atom-react-prime";
import { Button, Dialog } from "@/primereact";
import ProductFamily from "@/models/productFamily";
import { productFamilyRef } from "@/models/types";
import { UnitOfMeasure } from "@/models/unitOfMeasure";
import { UnitOfMeasureOptions } from "@/shared/unitOfMeasureLabels";
import { productFamilySchema, ProductFamilySchemaData } from "@/schemas/productFamilySchema";
import styles from "./editProductFamily.module.scss";

interface EditProductFamilyProps {
    family: ProductFamily | null;
    visible: boolean;
    onSave: (data: ProductFamilySchemaData, translateErrors: (errors: FormValidationErrors<ProductFamilySchemaData>) => void) => void;
    onHide: () => void;
}

const EditProductFamily: React.FC<EditProductFamilyProps> = ({ family, visible, onSave, onHide }) => {
    const isNew = family == null || family.id === productFamilyRef.default();

    const form = useForm<ProductFamilySchemaData>({
        resolver: zodResolver(productFamilySchema),
        defaultValues: {
            name: "",
            unitOfMeasure: UnitOfMeasure.Piece,
            minimumStockLevel: 0,
        },
    });

    useEffect(() => {
        if (visible) {
            form.reset({
                name: family?.name ?? "",
                unitOfMeasure: family?.unitOfMeasure ?? UnitOfMeasure.Piece,
                minimumStockLevel: family?.minimumStockLevel ?? 0,
            });
        }
    }, [visible, family, form]);

    const handleSubmit = (data: ProductFamilySchemaData): void => {
        form.clearErrors();
        onSave(data, translateErrorsToForm(form));
    };

    return (
        <Dialog
            header={isNew ? "Add Product Family" : "Edit Product Family"}
            visible={visible}
            onHide={onHide}
            className={styles.editDialog}
            data-test_id="ProductFamilies__Edit_Dialog"
        >
            <form onSubmit={(e) => void form.handleSubmit(handleSubmit)(e)} className={styles.formContent}>
                <FormInputText name="name" form={form} label="Name" inputProps={{ "data-test_id": "ProductFamilies__Name_Input" }} />
                <FormDropdown
                    name="unitOfMeasure"
                    form={form}
                    label="Unit of Measure"
                    options={UnitOfMeasureOptions}
                    optionLabel="label"
                    optionValue="value"
                />
                <FormInputNumber name="minimumStockLevel" form={form} label="Minimum Stock Level" />
                <div className={styles.formActions}>
                    <Button type="submit" label="Save" icon="pi pi-check" data-test_id="ProductFamilies__Save_Button" />
                    <Button type="button" label="Cancel" icon="pi pi-times" severity="secondary" outlined data-test_id="ProductFamilies__Cancel_Button" onClick={onHide} />
                </div>
            </form>
        </Dialog>
    );
};

export default EditProductFamily;
