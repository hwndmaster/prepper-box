import { put } from "redux-saga/effects";
import apiClient from "@/api/apiAxios";
import { convertProductApiToModel } from "@/api/converters/productConverters";
import LoadingTargets from "@/shared/loadingTargets";
import { dateToTicks } from "@/shared/helper";
import Product from "@/models/product";
import * as api from "@/api/api.generated";
import { callApi } from "../apiRequest";
import { SagaGenerator } from "../types";
import { typedSelect, withCallback, withLoading } from "../utils";
import * as productsActions from "./actions";
import * as productsActionsInternal from "./actionsInternal";
import { selectProductById } from "./selectors";

/**
 * Fetches products from the API and updates the store.
 */
export function* fetchProductsSaga(): Generator<unknown, void, unknown> {
    yield* withLoading(LoadingTargets.Products, function* () {
        const products: Product[] = yield* callApi(() => apiClient().products.productsAll())
            .fetchArray(convertProductApiToModel);
        yield put(productsActionsInternal.setProducts(products));
    });
}

/**
 * Creates a product via the API.
 * @param action The action containing the product to create.
 */
export function* createProductSaga(action: ReturnType<typeof productsActions.createProduct>): SagaGenerator {
    yield* withLoading(LoadingTargets.ActiveView, function* () {
        yield* withCallback(action.meta, function* () {
            const createRequest: api.CreateProductRequest = {
                name: action.payload.name,
                description: action.payload.description,
                categoryId: action.payload.categoryId,
                manufacturer: action.payload.manufacturer,
                barCode: action.payload.barCode,
                imageUrl: action.payload.imageUrl,
                imageSmallUrl: action.payload.imageSmallUrl,
                unitOfMeasure: action.payload.unitOfMeasure,
                minimumStockLevel: action.payload.minimumStockLevel,
            };
            const result = yield* callApi(() => apiClient().products.productsPOST(createRequest))
                .invoke();

            if (result == null) {
                throw new Error("API did not return created product.");
            }

            const createdProduct: Product = {
                ...action.payload,
                id: result.entityId,
                lastModified: result.lastModified,
                trackedProductsCount: 0,
                dateCreated: dateToTicks(new Date()),
            };
            yield put(productsActionsInternal.setProduct(createdProduct));

            return result.entityId;
        });
    });
}

/**
 * Updates a product via the API.
 * @param action The action containing the product to update.
 */
export function* updateProductSaga(action: ReturnType<typeof productsActions.updateProduct>): SagaGenerator {
    yield* withLoading(LoadingTargets.ActiveView, function* () {
        yield* withCallback(action.meta, function* () {
            const existing: Product | undefined = yield* typedSelect(selectProductById, action.payload.id);
            if (existing == null) {
                throw new Error(`Cannot update product with ID ${action.payload.id} because it does not exist in the store.`);
            }

            const updateRequest: api.UpdateProductRequest = {
                id: action.payload.id,
                lastModified: action.payload.lastModified,
                name: action.payload.name,
                description: action.payload.description,
                categoryId: action.payload.categoryId,
                manufacturer: action.payload.manufacturer,
                barCode: action.payload.barCode,
                imageUrl: action.payload.imageUrl,
                imageSmallUrl: action.payload.imageSmallUrl,
                unitOfMeasure: action.payload.unitOfMeasure,
                minimumStockLevel: action.payload.minimumStockLevel,
            };
            const result = yield* callApi(() => apiClient().products.productsPUT(updateRequest))
                .invoke();

            if (result == null) {
                throw new Error("API did not return updated product.");
            }

            const updatedProduct: Product = {
                ...existing,
                ...action.payload,
                lastModified: result.lastModified,
            };
            yield put(productsActionsInternal.setProduct(updatedProduct));

            return result.entityId;
        });
    });
}

/**
 * Deletes a product via the API.
 * @param action The action containing the ID of the product to delete.
 */
export function* deleteProductSaga(action: ReturnType<typeof productsActions.deleteProduct>): SagaGenerator {
    yield* withLoading(LoadingTargets.ActiveView, function* () {
        yield* withCallback(action.meta, function* () {
            yield* callApi(() => apiClient().products.productsDELETE(action.payload))
                .invoke();
            yield put(productsActionsInternal.removeProductFromStore(action.payload));
        });
    });
}

/**
 * Fetches products matching a barcode from the API.
 * @param action The action containing the barcode to search for.
 */
export function* fetchProductsByBarCodeSaga(action: ReturnType<typeof productsActions.fetchProductsByBarCode>): SagaGenerator {
    yield* withLoading(LoadingTargets.ActiveView, function* () {
        yield* withCallback(action.meta, function* () {
            const products: Product[] = yield* callApi(() => apiClient().products.byBarcode(action.payload))
                .fetchArray(convertProductApiToModel);
            return products;
        });
    });
}
