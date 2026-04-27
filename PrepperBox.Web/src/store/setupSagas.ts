import { SagaWatcher, SagaHandlingType } from "@hwndmaster/atom-react-redux";
import * as openFoodFactsSagas from "./openFoodFacts/sagas";
import * as categoriesSagas from "./categories/sagas";
import * as consumptionLogsSagas from "./consumptionLogs/sagas";
import * as productsSagas from "./products/sagas";
import * as storageLocationsSagas from "./storageLocations/sagas";
import * as trackedProductsSagas from "./trackedProducts/sagas";
import * as openFoodFacts from "./openFoodFacts";
import * as categories from "./categories";
import * as consumptionLogs from "./consumptionLogs";
import * as products from "./products";
import * as storageLocations from "./storageLocations";
import * as trackedProducts from "./trackedProducts";

const openFoodFactsWatchers: SagaWatcher[] = [
    { handlingType: SagaHandlingType.TakeLatest, action: openFoodFacts.Actions.searchByBarCode, saga: openFoodFactsSagas.searchByBarCodeSaga },
];

const categoriesWatchers: SagaWatcher[] = [
    { handlingType: SagaHandlingType.TakeLatest, action: categories.Actions.fetchCategories, saga: categoriesSagas.fetchCategoriesSaga },
    { handlingType: SagaHandlingType.TakeLatest, action: categories.Actions.createCategory, saga: categoriesSagas.createCategorySaga },
    { handlingType: SagaHandlingType.TakeLatest, action: categories.Actions.updateCategory, saga: categoriesSagas.updateCategorySaga },
    { handlingType: SagaHandlingType.TakeLatest, action: categories.Actions.deleteCategory, saga: categoriesSagas.deleteCategorySaga },
];

const productsWatchers: SagaWatcher[] = [
    { handlingType: SagaHandlingType.TakeLatest, action: products.Actions.fetchProducts, saga: productsSagas.fetchProductsSaga },
    { handlingType: SagaHandlingType.TakeLatest, action: products.Actions.fetchProductsByBarCode, saga: productsSagas.fetchProductsByBarCodeSaga },
    { handlingType: SagaHandlingType.TakeLatest, action: products.Actions.createProduct, saga: productsSagas.createProductSaga },
    { handlingType: SagaHandlingType.TakeLatest, action: products.Actions.updateProduct, saga: productsSagas.updateProductSaga },
    { handlingType: SagaHandlingType.TakeLatest, action: products.Actions.deleteProduct, saga: productsSagas.deleteProductSaga },
];

const trackedProductsWatchers: SagaWatcher[] = [
    { handlingType: SagaHandlingType.TakeLatest, action: trackedProducts.Actions.fetchTrackedProducts, saga: trackedProductsSagas.fetchTrackedProductsSaga },
    { handlingType: SagaHandlingType.TakeLatest, action: trackedProducts.Actions.createTrackedProduct, saga: trackedProductsSagas.createTrackedProductSaga },
    { handlingType: SagaHandlingType.TakeLatest, action: trackedProducts.Actions.updateTrackedProduct, saga: trackedProductsSagas.updateTrackedProductSaga },
    { handlingType: SagaHandlingType.TakeLatest, action: trackedProducts.Actions.deleteTrackedProduct, saga: trackedProductsSagas.deleteTrackedProductSaga },
    { handlingType: SagaHandlingType.TakeLatest, action: trackedProducts.Actions.withdrawTrackedProduct, saga: trackedProductsSagas.withdrawTrackedProductSaga },
];

const storageLocationsWatchers: SagaWatcher[] = [
    { handlingType: SagaHandlingType.TakeLatest, action: storageLocations.Actions.fetchStorageLocations, saga: storageLocationsSagas.fetchStorageLocationsSaga },
    { handlingType: SagaHandlingType.TakeLatest, action: storageLocations.Actions.createStorageLocation, saga: storageLocationsSagas.createStorageLocationSaga },
    { handlingType: SagaHandlingType.TakeLatest, action: storageLocations.Actions.updateStorageLocation, saga: storageLocationsSagas.updateStorageLocationSaga },
    { handlingType: SagaHandlingType.TakeLatest, action: storageLocations.Actions.deleteStorageLocation, saga: storageLocationsSagas.deleteStorageLocationSaga },
];

const consumptionLogsWatchers: SagaWatcher[] = [
    { handlingType: SagaHandlingType.TakeLatest, action: consumptionLogs.Actions.fetchConsumptionLogs, saga: consumptionLogsSagas.fetchConsumptionLogsSaga },
    { handlingType: SagaHandlingType.TakeLatest, action: consumptionLogs.Actions.createConsumptionLog, saga: consumptionLogsSagas.createConsumptionLogSaga },
    { handlingType: SagaHandlingType.TakeLatest, action: consumptionLogs.Actions.deleteConsumptionLog, saga: consumptionLogsSagas.deleteConsumptionLogSaga },
];

export const domainWatchers: SagaWatcher[] = [
    ...categoriesWatchers,
    ...consumptionLogsWatchers,
    ...openFoodFactsWatchers,
    ...productsWatchers,
    ...storageLocationsWatchers,
    ...trackedProductsWatchers,
];
