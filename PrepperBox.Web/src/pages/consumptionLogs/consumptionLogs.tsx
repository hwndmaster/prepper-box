import React, { useEffect, useMemo } from "react";
import { ticksToDate } from "@hwndmaster/atom-web-core";
import { LoadingSpinner } from "@hwndmaster/atom-react-redux";
import { Column, DataTable } from "@/primereact";
import * as store from "@/store";
import ConsumptionLog from "@/models/consumptionLog";
import LoadingTargets from "@/shared/loadingTargets";

const ConsumptionLogs: React.FC = () => {
    const dispatch = store.useAppDispatch();
    const consumptionLogs = store.useAppSelector((state) => state.consumptionLogs.consumptionLogs);
    const products = store.useAppSelector((state) => state.products.products);

    useEffect(() => {
        dispatch(store.ConsumptionLogs.Actions.fetchConsumptionLogs());
        dispatch(store.Products.Actions.fetchProducts());
    }, [dispatch]);

    const sortedLogs = useMemo(
        () => [...consumptionLogs].sort((a, b) => b.dateCreated - a.dateCreated),
        [consumptionLogs]
    );

    const productNameTemplate = (log: ConsumptionLog): React.ReactNode => {
        const product = products.find((p) => p.id === log.productId);
        return <span>{product?.name ?? log.productId}`</span>;
    };

    const dateTemplate = (log: ConsumptionLog): React.ReactNode => {
        return <span>{ticksToDate(log.dateCreated).toLocaleDateString()}</span>;
    };

    return (
        <LoadingSpinner target={LoadingTargets.ConsumptionLogs}>
            <DataTable value={sortedLogs} dataKey="id" data-test_id="ConsumptionLogs__Table">
                <Column header="Product" body={productNameTemplate} />
                <Column field="quantity" header="Quantity" />
                <Column field="reason" header="Reason" />
                <Column header="Date" body={dateTemplate} />
            </DataTable>
        </LoadingSpinner>
    );
};

export default ConsumptionLogs;
