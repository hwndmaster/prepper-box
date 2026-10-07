import React, { useState } from "react";
import { Button, Dialog, Dropdown } from "@/primereact";
import StorageLocation from "@/models/storageLocation";
import TrackedProduct from "@/models/trackedProduct";
import { StorageLocationRef, storageLocationRef } from "@/models/types";
import styles from "./changeStorageDialog.module.scss";

interface ChangeStorageDialogProps {
    trackedProduct: TrackedProduct | null;
    storageLocations: StorageLocation[];
    visible: boolean;
    onConfirm: (storageLocationId: StorageLocationRef) => void;
    onCancel: () => void;
}

const ChangeStorageDialog: React.FC<ChangeStorageDialogProps> = ({ trackedProduct, storageLocations, visible, onConfirm, onCancel }) => {
    const [storageLocationId, setStorageLocationId] = useState<StorageLocationRef>(storageLocationRef.default());

    const handleShow = (): void => {
        setStorageLocationId(trackedProduct?.storageLocationId ?? storageLocationRef.default());
    };

    const isUnchanged = trackedProduct == null || storageLocationId === trackedProduct.storageLocationId;
    // The dropdown treats null as "nothing selected" (placeholder, no clear icon), while the model uses the default ref.
    const selectedValue = storageLocationId === storageLocationRef.default() ? null : storageLocationId;

    return (
        <Dialog
            header="Change Storage"
            visible={visible}
            onHide={onCancel}
            onShow={handleShow}
            className={styles.changeStorageDialog}
            data-test_id="ChangeStorageDialog__Dialog"
        >
            <div className={styles.changeStorageContent}>
                <p>Select the new storage location:</p>
                <Dropdown
                    value={selectedValue}
                    options={storageLocations}
                    optionLabel="name"
                    optionValue="id"
                    showClear
                    placeholder="None"
                    itemTemplate={(location: StorageLocation) => (
                        <span data-test_id="ChangeStorageDialog__Storage_Option">{location.name}</span>
                    )}
                    onChange={(e) => setStorageLocationId((e.value as StorageLocationRef | null) ?? storageLocationRef.default())}
                    className={styles.storageDropdown}
                    data-test_id="ChangeStorageDialog__Storage"
                />
                <div className={styles.changeStorageActions}>
                    <Button
                        label="Change"
                        disabled={isUnchanged}
                        data-test_id="ChangeStorageDialog__Confirm"
                        onClick={() => onConfirm(storageLocationId)}
                    />
                    <Button
                        label="Cancel"
                        severity="secondary"
                        outlined
                        data-test_id="ChangeStorageDialog__Cancel"
                        onClick={onCancel}
                    />
                </div>
            </div>
        </Dialog>
    );
};

export default ChangeStorageDialog;
