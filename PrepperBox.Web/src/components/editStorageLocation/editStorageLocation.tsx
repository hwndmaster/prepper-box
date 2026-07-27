import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { translateErrorsToForm, useAtomForm, FormValidationErrors } from "@hwndmaster/atom-react-core";
import { FormInputText } from "@hwndmaster/atom-react-prime";
import { Button, Dialog } from "@/primereact";
import StorageLocation from "@/models/storageLocation";
import { storageLocationRef } from "@/models/types";
import { storageLocationSchema, StorageLocationSchemaData } from "@/schemas/storageLocationSchema";
import styles from "./editStorageLocation.module.scss";

interface EditStorageLocationProps {
    storageLocation: StorageLocation | null;
    visible: boolean;
    onSave: (data: StorageLocationSchemaData, translateErrors: (errors: FormValidationErrors<StorageLocationSchemaData>) => void) => void;
    onHide: () => void;
}

const EditStorageLocation: React.FC<EditStorageLocationProps> = ({ storageLocation, visible, onSave, onHide }) => {
    const isNew = storageLocation == null || storageLocation.id === storageLocationRef.default();

    const form = useAtomForm<StorageLocationSchemaData>({
        resolver: zodResolver(storageLocationSchema),
        defaultValues: {
            name: "",
        },
    });

    useEffect(() => {
        if (visible) {
            form.reset({
                name: storageLocation?.name ?? "",
            });
        }
    }, [visible, storageLocation, form]);

    const handleSubmit = (data: StorageLocationSchemaData): void => {
        form.clearErrors();
        onSave(data, translateErrorsToForm(form));
    };

    return (
        <Dialog
            header={isNew ? "Add Storage Location" : "Edit Storage Location"}
            visible={visible}
            onHide={onHide}
            className={styles.editDialog}
            data-test_id="StorageLocations__Edit_Dialog"
        >
            <form onSubmit={(e) => void form.handleSubmit(handleSubmit)(e)} className={styles.formContent}>
                <FormInputText name="name" form={form} label="Name" inputProps={{ "data-test_id": "StorageLocations__Name_Input" }} />
                <div className={styles.formActions}>
                    <Button type="submit" label="Save" icon="pi pi-check" data-test_id="StorageLocations__Save_Button" />
                    <Button type="button" label="Cancel" icon="pi pi-times" severity="secondary" outlined data-test_id="StorageLocations__Cancel_Button" onClick={onHide} />
                </div>
            </form>
        </Dialog>
    );
};

export default EditStorageLocation;
