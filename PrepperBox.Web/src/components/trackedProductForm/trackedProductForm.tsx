import React from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as store from "@/store";
import { storageLocationRef } from "@/models/types";
import { FormDropdown, FormInputNumber, FormInputText, FormInputTextarea } from "@/components/forms";
import { trackedProductFormSchema, TrackedProductFormData } from "./trackedProductForm.schema";
import styles from "./trackedProductForm.module.scss";

interface TrackedProductFormFieldsProps {
    form: UseFormReturn<TrackedProductFormData>;
}

const TrackedProductFormFields: React.FC<TrackedProductFormFieldsProps> = ({ form }) => {
    const storageLocations = store.useAppSelector((state) => state.storageLocations.storageLocations);
    const today = new Date().toISOString().slice(0, 10);

    return (
        <>
            <div className={styles.row}>
                <FormInputNumber name="quantity" form={form}
                    allowDecimals={true}
                    label="Quantity" />
                <FormInputText
                    name="expirationDate"
                    form={form}
                    label="Expiration Date"
                    disableFloatingLabel
                    inputProps={{ type: "date", min: today }}
                />
                <FormDropdown
                    name="storageLocationId"
                    form={form}
                    label="Storage Location"
                    options={storageLocations}
                    optionLabel="name"
                    optionValue="id"
                    inputProps={{ showClear: true, placeholder: "None" }}
                />
            </div>
            <div className={styles.row}>
                <FormInputTextarea name="notes" form={form} label="Notes" inputProps={{ rows: 5 }} />
            </div>
        </>
    );
};

/**
 * Custom hook to initialize the form for tracked products with default values and validation schema.
 */
function useTrackedProductForm(): UseFormReturn<TrackedProductFormData> {
    return useForm<TrackedProductFormData>({
        resolver: zodResolver(trackedProductFormSchema),
        defaultValues: {
            quantity: 1,
            storageLocationId: storageLocationRef.default(),
            expirationDate: "",
            notes: undefined,
        },
    });
}

export type { TrackedProductFormData };
export { TrackedProductFormFields, useTrackedProductForm };

