import { combineReducers, Reducer, Store, UnknownAction } from "redux";
import createSagaMiddleware from "redux-saga";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { PersistConfig, Persistor, PersistorAction, persistReducer, PersistState, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage

import { toastService } from "@/shared/ui/toastService";
import { isDev } from "@/shared/constants";
import defaultLogger from "../shared/logger";
import { watchApplication } from "./setupSagas";
import AppState from "./appState";

import commonReducer from "./common/reducers";
import categoriesReducer from "./categories/reducers";
import consumptionLogsReducer from "./consumptionLogs/reducers";
import productsReducer from "./products/reducers";
import trackedProductsReducer from "./trackedProducts/reducers";

type AppStore = Store<Partial<AppState>, UnknownAction, unknown>;

/**
 * Represents the partial state that is persisted. Copied from the redux-persist library.
 */
interface PersistPartial {
    // This is a workaround to allow the _ in the property name, as it is used in the original redux-persist library
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _persist: PersistState;
}

/**
 * Creates a new instance of a store.
 * @param preloadedState A state to be used in the store initialization.
 * @returns An instance of a store.
 */
function setupStore(
    preloadedState?: Partial<AppState>,
    isTestEnvironment: boolean | undefined = false
): {
    store: AppStore;
    sagaMiddleware: ReturnType<typeof createSagaMiddleware>;
    persistor: ReturnType<typeof persistStore>;
} {
    const sagaMiddleware = createSagaMiddleware({
        onError(error, errorInfo) {
            defaultLogger.error("An error occurred in the Saga middleware:", error, errorInfo);
        },
    });

    // Whenever an action is dispatched, Redux will update each top-level application state property using
    // the reducer with the matching name. It's important that the names match exactly, and that the reducer
    // acts on the corresponding ApplicationState property type.
    const appStoreReducers = {
        common: commonReducer,
        categories: categoriesReducer,
        consumptionLogs: consumptionLogsReducer,
        products: productsReducer,
        trackedProducts: trackedProductsReducer,
    };

    const persistConfig: PersistConfig<AppState> = {
        key: "root",
        storage: storage,
        version: 1, // Increment this number if the persisted state structure changes
        blacklist: ["common"],

        // This is a workaround to avoid persisting the whole state in the test environment:
        whitelist: isTestEnvironment ? ["a-non-existing-reducer"] : undefined,
        migrate: async (state: PersistPartial | undefined, currentVersion: number) => {
            if (state != undefined && state._persist.version !== currentVersion) {
                const migrationReducers = combineReducers(appStoreReducers);
                const initialStateOfCurrentVersion = migrationReducers(undefined, { type: "@@INIT" });
                return Promise.resolve(initialStateOfCurrentVersion as AppState & PersistPartial);
            }
            return Promise.resolve(state as AppState & PersistPartial);
        },
    };

    const reducers: Reducer<AppState & PersistPartial> = isTestEnvironment
        ? combineReducers({
            ...appStoreReducers,
            _persist: { version: 0, rehydrated: true },
        })
        : persistReducer(persistConfig, combineReducers(appStoreReducers));

    const store = configureStore({
        reducer: reducers,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: false,
            }).concat(sagaMiddleware),
        preloadedState: {
            ...preloadedState,
        } as AppState & PersistPartial,
        devTools: isDev, // Enable Redux DevTools in development mode
    });

    const persistor = isTestEnvironment ? createEmptyPersistor() : persistStore(store);

    return { store, sagaMiddleware, persistor };
}

let storeInstance: AppStore;
let persistorInstance: ReturnType<typeof persistStore>;

/**
 * Retrieves the current instance of the application store.
 * If the store is not already initialized, it sets up a new store.
 *
 * @returns {AppStore} The current application store instance.
 */
function getStore(): AppStore {
    if (storeInstance === undefined) {
        const { store, sagaMiddleware, persistor } = setupStore({});
        storeInstance = store;
        persistorInstance = persistor;
        const task = sagaMiddleware.run(watchApplication);
        task.toPromise().catch((error: unknown) => {
            const msg = "The application runner stopped working due to an unexpected error. Please restart the application.";
            defaultLogger.error(`${msg} Details: %o`, error);
            toastService.showError(msg);
        });
    }
    return storeInstance;
}

/**
 * Sets the application store to a specified instance.
 * Note: Must NOT be used outside tests.
 *
 * @param {AppStore} store - The store instance to set.
 */
function setStore(store: AppStore, persistor: Persistor): void {
    storeInstance = store;
    persistorInstance = persistor;
}

/**
 * Retrieves the current instance of the persistor.
 * @returns The current instance of the persistor.
 */
function getPersistor(): ReturnType<typeof persistStore> {
    getStore(); // Ensure the store is initialized

    return persistorInstance;
}

function createEmptyPersistor(): Persistor {
    return {
        pause: () => {},
        persist: () => {},
        purge: async () => Promise.resolve(),
        flush: async () => Promise.resolve(),
        dispatch: (persistorAction: PersistorAction) => persistorAction,
        getState: () => ({ registry: [], bootstrapped: true }),
        subscribe: () => () => {},
    } as Persistor;
}

export type AppDispatch = typeof storeInstance.dispatch;
export { type AppStore };
export const useAppDispatch = useDispatch.withTypes<AppDispatch>(); // Export a hook that can be reused to resolve types
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;
export { setupStore, getStore, setStore, getPersistor };
