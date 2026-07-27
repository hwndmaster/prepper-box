import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { translateErrorsToForm, useAtomForm, FormValidationErrors } from "@hwndmaster/atom-react-core";
import { FormInputText } from "@hwndmaster/atom-react-prime";
import { Button, Dialog } from "@/primereact";
import Category from "@/models/category";
import { categoryRef } from "@/models/types";
import { categorySchema, CategorySchemaData } from "@/schemas/categorySchema";
import styles from "./editCategory.module.scss";

interface EditCategoryProps {
    category: Category | null;
    visible: boolean;
    onSave: (data: CategorySchemaData, translateErrors: (errors: FormValidationErrors<CategorySchemaData>) => void) => void;
    onHide: () => void;
}

const EditCategory: React.FC<EditCategoryProps> = ({ category, visible, onSave, onHide }) => {
    const isNew = category == null || category.id === categoryRef.default();

    const form = useAtomForm<CategorySchemaData>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: "",
            description: "",
            iconName: "other",
        },
    });

    useEffect(() => {
        if (visible) {
            form.reset({
                name: category?.name ?? "",
                description: category?.description ?? "",
                iconName: category?.iconName ?? "other",
            });
        }
    }, [visible, category, form]);

    const handleSubmit = (data: CategorySchemaData): void => {
        form.clearErrors();
        onSave(data, translateErrorsToForm(form));
    };

    return (
        <Dialog
            header={isNew ? "Add Category" : "Edit Category"}
            visible={visible}
            onHide={onHide}
            className={styles.editDialog}
            data-test_id="Categories__Edit_Dialog"
        >
            <form onSubmit={(e) => void form.handleSubmit(handleSubmit)(e)} className={styles.formContent}>
                <FormInputText name="name" form={form} label="Name" inputProps={{ "data-test_id": "Categories__Name_Input" }} />
                <FormInputText name="description" form={form} label="Description" inputProps={{ "data-test_id": "Categories__Description_Input" }} />
                <FormInputText name="iconName" form={form} label="Icon Name" inputProps={{ "data-test_id": "Categories__IconName_Input" }} />
                <div className={styles.formActions}>
                    <Button type="submit" label="Save" icon="pi pi-check" data-test_id="Categories__Save_Button" />
                    <Button type="button" label="Cancel" icon="pi pi-times" severity="secondary" outlined data-test_id="Categories__Cancel_Button" onClick={onHide} />
                </div>
            </form>
        </Dialog>
    );
};

export default EditCategory;
