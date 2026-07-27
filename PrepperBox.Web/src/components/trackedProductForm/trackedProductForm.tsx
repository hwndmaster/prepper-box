import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { UseFormReturn } from "react-hook-form";
import { useAtomForm } from "@hwndmaster/atom-react-core";
import { FormDropdown, FormInputNumber, FormInputText, FormInputTextarea } from "@hwndmaster/atom-react-prime";
import * as store from "@/store";
import { storageLocationRef } from "@/models/types";
import { trackedProductSchema, TrackedProductSchemaData } from "@/schemas/trackedProductSchema";
import styles from "./trackedProductForm.module.scss";

interface TrackedProductFormFieldsProps {
    form: UseFormReturn<TrackedProductSchemaData>;
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
function useTrackedProductForm(): UseFormReturn<TrackedProductSchemaData> {
    return useAtomForm<TrackedProductSchemaData>({
        resolver: zodResolver(trackedProductSchema),
        defaultValues: {
            quantity: 1,
            storageLocationId: storageLocationRef.default(),
            expirationDate: "",
            notes: undefined,
        },
    });
}

export { TrackedProductFormFields, useTrackedProductForm };

