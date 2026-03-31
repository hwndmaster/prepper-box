import React, { useEffect } from "react";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import * as store from "@/store";
import Category from "@/models/category";
import LoadingTargets from "@/shared/loadingTargets";
import { LoadingSpinner } from "@/components/loadingSpinner";

const Categories: React.FC = () => {
    const dispatch = store.useAppDispatch();
    const categories = store.useAppSelector((state) => state.categories.categories);

    useEffect(() => {
        dispatch(store.Categories.Actions.fetchCategories());
    }, [dispatch]);

    const dateCreatedTemplate = (category: Category): React.ReactNode => {
        return <span>{category.dateCreated.toLocaleDateString()}</span>;
    };

    return (
        <LoadingSpinner target={LoadingTargets.Categories}>
            <DataTable value={categories} dataKey="id" data-test_id="Categories__Table">
                <Column field="name" header="Name" />
                <Column field="description" header="Description" />
                <Column field="iconName" header="Icon" />
                <Column field="dateCreated" header="Date Created" body={dateCreatedTemplate} />
            </DataTable>
        </LoadingSpinner>
    );
};

export default Categories;
