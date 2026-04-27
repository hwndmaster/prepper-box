import React, { useEffect, useState } from "react";
import { LoadingSpinner } from "@hwndmaster/atom-react-redux";
import { Button, Column, confirmDialog, DataTable } from "@/primereact";
import * as store from "@/store";
import StorageLocation from "@/models/storageLocation";
import { storageLocationRef, StorageLocationRef } from "@/models/types";
import LoadingTargets from "@/shared/loadingTargets";
import { EditStorageLocation, EditStorageLocationFormData } from "@/components/editStorageLocation";
import styles from "./storageLocations.module.scss";

const EmptyStorageLocation: StorageLocation = {
    id: storageLocationRef.default(),
    name: "",
    lastModified: 0,
    dateCreated: 0,
};

const StorageLocations: React.FC = () => {
    const dispatch = store.useAppDispatch();
    const storageLocations = store.useAppSelector((state) => state.storageLocations.storageLocations);
    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const [editingLocation, setEditingLocation] = useState<StorageLocation>(EmptyStorageLocation);

    useEffect(() => {
        dispatch(store.StorageLocations.Actions.fetchStorageLocations());
    }, [dispatch]);

    const openNewDialog = (): void => {
        setEditingLocation(EmptyStorageLocation);
        setIsDialogVisible(true);
    };

    const openEditDialog = (location: StorageLocation): void => {
        setEditingLocation(location);
        setIsDialogVisible(true);
    };

    const handleSave = (data: EditStorageLocationFormData): void => {
        const updated: StorageLocation = {
            ...editingLocation,
            name: data.name,
        };

        if (editingLocation.id === storageLocationRef.default()) {
            dispatch(store.StorageLocations.Actions.createStorageLocation(updated, () => {
                setIsDialogVisible(false);
            }));
        } else {
            dispatch(store.StorageLocations.Actions.updateStorageLocation(updated, () => {
                setIsDialogVisible(false);
            }));
        }
    };

    const handleDelete = (id: StorageLocationRef): void => {
        confirmDialog({
            message: "Are you sure you want to delete this storage location?",
            header: "Confirm Delete",
            icon: "pi pi-exclamation-triangle",
            acceptClassName: "p-button-danger",
            accept: () => {
                dispatch(store.StorageLocations.Actions.deleteStorageLocation(id));
            },
        });
    };

    const actionsTemplate = (location: StorageLocation): React.ReactNode => {
        return (
            <div className={styles.actionsCell}>
                <Button
                    icon="pi pi-pencil"
                    severity="info"
                    text
                    rounded
                    data-test_id="StorageLocations__Edit_Button"
                    onClick={() => openEditDialog(location)}
                />
                <Button
                    icon="pi pi-trash"
                    severity="danger"
                    text
                    rounded
                    data-test_id="StorageLocations__Delete_Button"
                    onClick={() => handleDelete(location.id)}
                />
            </div>
        );
    };

    return (
        <LoadingSpinner target={LoadingTargets.StorageLocations}>
            <div className={styles.header}>
                <div />
                <div className={styles.headerRight}>
                    <Button
                        label="Add Storage Location"
                        icon="pi pi-plus"
                        severity="success"
                        data-test_id="StorageLocations__Add_Button"
                        onClick={openNewDialog}
                    />
                </div>
            </div>
            <DataTable value={storageLocations} dataKey="id" data-test_id="StorageLocations__Table">
                <Column field="name" header="Name" />
                <Column header="Actions" body={actionsTemplate} className={styles.actionColumn} />
            </DataTable>

            <EditStorageLocation
                storageLocation={editingLocation}
                visible={isDialogVisible}
                onSave={handleSave}
                onHide={() => setIsDialogVisible(false)}
            />
        </LoadingSpinner>
    );
};

export default StorageLocations;
