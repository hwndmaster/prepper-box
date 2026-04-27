import { createAppStore } from "@hwndmaster/atom-react-redux";
import AppState from "./appState";

import categoriesReducer from "./categories/reducers";
import consumptionLogsReducer from "./consumptionLogs/reducers";
import productsReducer from "./products/reducers";
import storageLocationsReducer from "./storageLocations/reducers";
import trackedProductsReducer from "./trackedProducts/reducers";

import { domainWatchers } from "./setupSagas";

const {
    setupStore,
    getStore,
    setStore,
    getPersistor,
    useAppDispatch,
    useAppSelector,
    watchApplication,
    applicationWatchers,
} = createAppStore<AppState>({
    domainReducers: {
        categories: categoriesReducer,
        consumptionLogs: consumptionLogsReducer,
        products: productsReducer,
        storageLocations: storageLocationsReducer,
        trackedProducts: trackedProductsReducer,
    },
    domainWatchers,
    persistKey: "root",
    persistVersion: 2,
    persistBlacklist: ["common"],
});

export type AppDispatch = ReturnType<ReturnType<typeof getStore>["dispatch"]>;
export { setupStore, getStore, setStore, getPersistor, useAppDispatch, useAppSelector, watchApplication, applicationWatchers };
