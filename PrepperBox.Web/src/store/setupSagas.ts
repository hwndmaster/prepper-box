import { Task } from "redux-saga";
import { takeLatest, cancel, CancelEffect, ForkEffect, takeEvery, put } from "redux-saga/effects";
import { HasToastedError } from "@/shared/errorInfo";
import * as openFoodFactsSagas from "./openFoodFacts/sagas";
import * as commonSagas from "./common/sagas";
import * as categoriesSagas from "./categories/sagas";
import * as consumptionLogsSagas from "./consumptionLogs/sagas";
import * as productsSagas from "./products/sagas";
import * as storageLocationsSagas from "./storageLocations/sagas";
import * as trackedProductsSagas from "./trackedProducts/sagas";
import * as openFoodFacts from "./openFoodFacts";
import * as common from "./common";
import * as categories from "./categories";
import * as consumptionLogs from "./consumptionLogs";
import * as products from "./products";
import * as storageLocations from "./storageLocations";
import * as trackedProducts from "./trackedProducts";

/**
 * A saga which cancels a worker.
 * @param task The task.
 */
function* cancelWorkerSaga(task: Task): IterableIterator<CancelEffect> {
    yield cancel(task);
}

enum SagaHandlingType {
    TakeLatest = 1,
    TakeEvery = 2,
}

const commonWatchers = [
    { handlingType: SagaHandlingType.TakeEvery, action: common.Actions.raiseError, saga: commonSagas.raiseErrorSaga },
];

const openFoodFactsWatchers = [
    { handlingType: SagaHandlingType.TakeLatest, action: openFoodFacts.Actions.searchByBarCode, saga: openFoodFactsSagas.searchByBarCodeSaga },
];

const categoriesWatchers = [
    { handlingType: SagaHandlingType.TakeLatest, action: categories.Actions.fetchCategories, saga: categoriesSagas.fetchCategoriesSaga },
    { handlingType: SagaHandlingType.TakeLatest, action: categories.Actions.createCategory, saga: categoriesSagas.createCategorySaga },
    { handlingType: SagaHandlingType.TakeLatest, action: categories.Actions.updateCategory, saga: categoriesSagas.updateCategorySaga },
    { handlingType: SagaHandlingType.TakeLatest, action: categories.Actions.deleteCategory, saga: categoriesSagas.deleteCategorySaga },
];

const productsWatchers = [
    { handlingType: SagaHandlingType.TakeLatest, action: products.Actions.fetchProducts, saga: productsSagas.fetchProductsSaga },
    { handlingType: SagaHandlingType.TakeLatest, action: products.Actions.fetchProductsByBarCode, saga: productsSagas.fetchProductsByBarCodeSaga },
    { handlingType: SagaHandlingType.TakeLatest, action: products.Actions.createProduct, saga: productsSagas.createProductSaga },
    { handlingType: SagaHandlingType.TakeLatest, action: products.Actions.updateProduct, saga: productsSagas.updateProductSaga },
    { handlingType: SagaHandlingType.TakeLatest, action: products.Actions.deleteProduct, saga: productsSagas.deleteProductSaga },
];

const trackedProductsWatchers = [
    { handlingType: SagaHandlingType.TakeLatest, action: trackedProducts.Actions.fetchTrackedProducts, saga: trackedProductsSagas.fetchTrackedProductsSaga },
    { handlingType: SagaHandlingType.TakeLatest, action: trackedProducts.Actions.createTrackedProduct, saga: trackedProductsSagas.createTrackedProductSaga },
    { handlingType: SagaHandlingType.TakeLatest, action: trackedProducts.Actions.updateTrackedProduct, saga: trackedProductsSagas.updateTrackedProductSaga },
    { handlingType: SagaHandlingType.TakeLatest, action: trackedProducts.Actions.deleteTrackedProduct, saga: trackedProductsSagas.deleteTrackedProductSaga },
    { handlingType: SagaHandlingType.TakeLatest, action: trackedProducts.Actions.withdrawTrackedProduct, saga: trackedProductsSagas.withdrawTrackedProductSaga },
];

const storageLocationsWatchers = [
    { handlingType: SagaHandlingType.TakeLatest, action: storageLocations.Actions.fetchStorageLocations, saga: storageLocationsSagas.fetchStorageLocationsSaga },
    { handlingType: SagaHandlingType.TakeLatest, action: storageLocations.Actions.createStorageLocation, saga: storageLocationsSagas.createStorageLocationSaga },
    { handlingType: SagaHandlingType.TakeLatest, action: storageLocations.Actions.updateStorageLocation, saga: storageLocationsSagas.updateStorageLocationSaga },
    { handlingType: SagaHandlingType.TakeLatest, action: storageLocations.Actions.deleteStorageLocation, saga: storageLocationsSagas.deleteStorageLocationSaga },
];

const consumptionLogsWatchers = [
    { handlingType: SagaHandlingType.TakeLatest, action: consumptionLogs.Actions.fetchConsumptionLogs, saga: consumptionLogsSagas.fetchConsumptionLogsSaga },
    { handlingType: SagaHandlingType.TakeLatest, action: consumptionLogs.Actions.createConsumptionLog, saga: consumptionLogsSagas.createConsumptionLogSaga },
    { handlingType: SagaHandlingType.TakeLatest, action: consumptionLogs.Actions.deleteConsumptionLog, saga: consumptionLogsSagas.deleteConsumptionLogSaga },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function* errorFallback<TFn extends (...args: any[]) => any>(sagaFunction: TFn, action: any): Generator<any, any, any> {
    try {
        yield sagaFunction(action);
    } catch (error) {
        if (error instanceof Object
            && "toasted" in error
            && (error as HasToastedError).toasted === true
        ) {
            return;
        }
        yield put(common.Actions.raiseError(error));
    }
}

const applicationWatchers = [
    ...commonWatchers,
    ...categoriesWatchers,
    ...consumptionLogsWatchers,
    ...openFoodFactsWatchers,
    ...productsWatchers,
    ...storageLocationsWatchers,
    ...trackedProductsWatchers,
];

/**
 * A saga to start watching the application state.
 */
function* watchApplication(): IterableIterator<ForkEffect<never>> {
    for (const item of applicationWatchers) {
        if (item.handlingType === SagaHandlingType.TakeLatest) {
            yield takeLatest(item.action, errorFallback, item.saga);
        } else if (item.handlingType === SagaHandlingType.TakeEvery) {
            yield takeEvery(item.action, errorFallback, item.saga);
        } else {
            throw new Error("Unexpected value of the saga handling type.");
        }
    }
}

export {
    cancelWorkerSaga, // TODO: Not used yet!
    SagaHandlingType, // for fakeStore only
    applicationWatchers, // for fakeStore only
    watchApplication,
};
