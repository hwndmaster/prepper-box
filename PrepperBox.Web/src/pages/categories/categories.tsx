import React, { useEffect, useState } from "react";
import { Button, Column, confirmDialog, DataTable } from "@/primereact";
import * as store from "@/store";
import Category from "@/models/category";
import { categoryRef, CategoryRef } from "@/models/types";
import LoadingTargets from "@/shared/loadingTargets";
import { getCategoryIconClass } from "@/shared/categoryIcons";
import { LoadingSpinner } from "@/components/loadingSpinner";
import { EditCategory, EditCategoryFormData } from "@/components/editCategory";
import styles from "./categories.module.scss";

const EmptyCategory: Category = {
    id: categoryRef.default(),
    name: "",
    description: "",
    iconName: "other",
    lastModified: 0,
    dateCreated: 0,
};

const Categories: React.FC = () => {
    const dispatch = store.useAppDispatch();
    const categories = store.useAppSelector((state) => state.categories.categories);
    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category>(EmptyCategory);

    useEffect(() => {
        dispatch(store.Categories.Actions.fetchCategories());
    }, [dispatch]);

    const openNewDialog = (): void => {
        setEditingCategory(EmptyCategory);
        setIsDialogVisible(true);
    };

    const openEditDialog = (category: Category): void => {
        setEditingCategory(category);
        setIsDialogVisible(true);
    };

    const handleSave = (data: EditCategoryFormData): void => {
        const updated: Category = {
            ...editingCategory,
            name: data.name,
            description: data.description,
            iconName: data.iconName,
        };

        if (editingCategory.id === categoryRef.default()) {
            dispatch(store.Categories.Actions.createCategory(updated, () => {
                setIsDialogVisible(false);
            }));
        } else {
            dispatch(store.Categories.Actions.updateCategory(updated, () => {
                setIsDialogVisible(false);
            }));
        }
    };

    const handleDelete = (id: CategoryRef): void => {
        confirmDialog({
            message: "Are you sure you want to delete this category?",
            header: "Confirm Delete",
            icon: "pi pi-exclamation-triangle",
            acceptClassName: "p-button-danger",
            accept: () => {
                dispatch(store.Categories.Actions.deleteCategory(id));
            },
        });
    };

    const iconTemplate = (category: Category): React.ReactNode => {
        return <i className={getCategoryIconClass(category.iconName)} />;
    };

    const actionsTemplate = (category: Category): React.ReactNode => {
        return (
            <div className={styles.actionsCell}>
                <Button
                    icon="pi pi-pencil"
                    severity="info"
                    text
                    rounded
                    data-test_id="Categories__Edit_Button"
                    onClick={() => openEditDialog(category)}
                />
                <Button
                    icon="pi pi-trash"
                    severity="danger"
                    text
                    rounded
                    data-test_id="Categories__Delete_Button"
                    onClick={() => handleDelete(category.id)}
                />
            </div>
        );
    };

    return (
        <LoadingSpinner target={LoadingTargets.Categories}>
            <div className={styles.header}>
                <div />
                <div className={styles.headerRight}>
                    <Button
                        label="Add Category"
                        icon="pi pi-plus"
                        severity="success"
                        data-test_id="Categories__Add_Button"
                        onClick={openNewDialog}
                    />
                </div>
            </div>
            <DataTable value={categories} dataKey="id" data-test_id="Categories__Table">
                <Column field="iconName" header="Icon" body={iconTemplate} className={styles.iconColumn} />
                <Column field="name" header="Name" />
                <Column field="description" header="Description" />
                <Column header="Actions" body={actionsTemplate} className={styles.actionColumn} />
            </DataTable>

            <EditCategory
                category={editingCategory}
                visible={isDialogVisible}
                onSave={handleSave}
                onHide={() => setIsDialogVisible(false)}
            />
        </LoadingSpinner>
    );
};

export default Categories;
