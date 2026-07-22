import React, { useEffect, useState } from "react";
import { LoadingSpinner } from "@hwndmaster/atom-react-redux";
import { Button, Column, confirmDialog, DataTable, type DataTableExpandedRows } from "@/primereact";
import * as store from "@/store";
import Category from "@/models/category";
import ProductFamily from "@/models/productFamily";
import { categoryRef, CategoryRef } from "@/models/types";
import LoadingTargets from "@/shared/loadingTargets";
import { getCategoryIconClass } from "@/shared/categoryIcons";
import { UnitOfMeasureLabels } from "@/shared/unitOfMeasureLabels";
import { EditCategory, EditCategoryFormData } from "@/components/editCategory";
import { EditProductFamily, EditProductFamilyFormData } from "@/components/editProductFamily";
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
    const productFamilies = store.useAppSelector((state) => state.productFamilies.productFamilies);
    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category>(EmptyCategory);
    const [expandedRows, setExpandedRows] = useState<DataTableExpandedRows>({});
    const [isFamilyDialogVisible, setIsFamilyDialogVisible] = useState(false);
    const [editingFamily, setEditingFamily] = useState<ProductFamily | null>(null);
    const [familyCategoryId, setFamilyCategoryId] = useState<CategoryRef>(categoryRef.default());

    useEffect(() => {
        dispatch(store.Categories.Actions.fetchCategories());
        dispatch(store.ProductFamilies.Actions.fetchProductFamilies());
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

    const openNewFamilyDialog = (categoryId: CategoryRef): void => {
        setFamilyCategoryId(categoryId);
        setEditingFamily(null);
        setIsFamilyDialogVisible(true);
    };

    const openEditFamilyDialog = (family: ProductFamily): void => {
        setFamilyCategoryId(family.categoryId);
        setEditingFamily(family);
        setIsFamilyDialogVisible(true);
    };

    const handleSaveFamily = (data: EditProductFamilyFormData): void => {
        if (editingFamily == null) {
            dispatch(store.ProductFamilies.Actions.createProductFamily({
                categoryId: familyCategoryId,
                name: data.name,
                unitOfMeasure: data.unitOfMeasure,
                minimumStockLevel: data.minimumStockLevel,
            }, () => {
                setIsFamilyDialogVisible(false);
            }));
        } else {
            dispatch(store.ProductFamilies.Actions.updateProductFamily({
                id: editingFamily.id,
                lastModified: editingFamily.lastModified,
                categoryId: editingFamily.categoryId,
                name: data.name,
                unitOfMeasure: data.unitOfMeasure,
                minimumStockLevel: data.minimumStockLevel,
            }, () => {
                setIsFamilyDialogVisible(false);
            }));
        }
    };

    const handleDeleteFamily = (family: ProductFamily): void => {
        confirmDialog({
            message: `Are you sure you want to delete the "${family.name}" family?`,
            header: "Confirm Delete",
            icon: "pi pi-exclamation-triangle",
            acceptClassName: "p-button-danger",
            accept: () => {
                dispatch(store.ProductFamilies.Actions.deleteProductFamily(family.id));
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

    const familyRowExpansionTemplate = (category: Category): React.ReactNode => {
        const families = productFamilies
            .filter((family) => family.categoryId === category.id)
            .sort((a, b) => a.name.localeCompare(b.name));

        const unitTemplate = (family: ProductFamily): React.ReactNode => {
            return <span>{UnitOfMeasureLabels[family.unitOfMeasure]}</span>;
        };

        const familyActionsTemplate = (family: ProductFamily): React.ReactNode => {
            return (
                <div className={styles.actionsCell}>
                    <Button
                        icon="pi pi-pencil"
                        severity="info"
                        text
                        rounded
                        data-test_id="ProductFamilies__Edit_Button"
                        onClick={() => openEditFamilyDialog(family)}
                    />
                    <Button
                        icon="pi pi-trash"
                        severity="danger"
                        text
                        rounded
                        disabled={family.productsCount > 0}
                        data-test_id="ProductFamilies__Delete_Button"
                        onClick={() => handleDeleteFamily(family)}
                    />
                </div>
            );
        };

        return (
            <div className={styles.familiesContainer}>
                <div className={styles.familiesHeader}>
                    <h4>Product Families</h4>
                    <Button
                        label="Add Family"
                        icon="pi pi-plus"
                        severity="success"
                        text
                        data-test_id="ProductFamilies__Add_Button"
                        onClick={() => openNewFamilyDialog(category.id)}
                    />
                </div>
                <DataTable value={families} dataKey="id" data-test_id="ProductFamilies__Table" emptyMessage="No families in this category yet.">
                    <Column field="name" header="Name" />
                    <Column field="unitOfMeasure" header="Unit" body={unitTemplate} />
                    <Column field="minimumStockLevel" header="Min Stock" />
                    <Column field="productsCount" header="Products" />
                    <Column header="Actions" body={familyActionsTemplate} className={styles.actionColumn} />
                </DataTable>
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
            <DataTable
                value={categories}
                dataKey="id"
                expandedRows={expandedRows}
                onRowToggle={(e) => setExpandedRows(e.data as DataTableExpandedRows)}
                rowExpansionTemplate={familyRowExpansionTemplate}
                data-test_id="Categories__Table"
            >
                <Column expander className={styles.expanderColumn} />
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

            <EditProductFamily
                family={editingFamily}
                visible={isFamilyDialogVisible}
                onSave={handleSaveFamily}
                onHide={() => setIsFamilyDialogVisible(false)}
            />
        </LoadingSpinner>
    );
};

export default Categories;
