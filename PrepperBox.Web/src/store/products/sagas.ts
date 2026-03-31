import { put } from "redux-saga/effects";
import apiClient from "@/api/apiAxios";
import { convertProductApiToModel } from "@/api/converters/productConverters";
import LoadingTargets from "@/shared/loadingTargets";
import Product from "@/models/product";
import * as api from "@/api/api.generated";
import { productRef } from "@/models/types";
import { callApi } from "../apiRequest";
import { SagaGenerator } from "../types";
import { withCallback, withLoading } from "../utils";
import * as productsActions from "./actions";
import * as productsActionsInternal from "./actionsInternal";

/**
 * Core logic for saving a product to the API and updating the store.
 */
function* saveProductCore(productToSave: Product): SagaGenerator {
    const isNewProduct = productToSave.id === productRef.default();

    if (isNewProduct) {
        const createRequest: api.CreateProductRequest = {
            name: productToSave.name,
            description: productToSave.description,
            categoryId: productToSave.categoryId,
            manufacturer: productToSave.manufacturer,
            barCode: productToSave.barCode,
        };
        const result = yield* callApi(() => apiClient().products.productsPOST(createRequest))
            .invoke();

        if (result == null) {
            throw new Error("API did not return created product.");
        }

        const createdProduct: Product = {
            ...productToSave,
            id: result.entityId,
            lastModified: result.lastModified,
        };
        yield put(productsActionsInternal.setProduct(createdProduct));

        return result.entityId;
    } else {
        const updateRequest: api.UpdateProductRequest = {
            id: productToSave.id,
            lastModified: productToSave.lastModified,
            name: productToSave.name,
            description: productToSave.description,
            categoryId: productToSave.categoryId,
            manufacturer: productToSave.manufacturer,
            barCode: productToSave.barCode,
        };
        const result = yield* callApi(() => apiClient().products.productsPUT(updateRequest))
            .invoke();

        if (result == null) {
            throw new Error("API did not return updated product.");
        }

        const updatedProduct: Product = {
            ...productToSave,
            lastModified: result.lastModified,
        };
        yield put(productsActionsInternal.setProduct(updatedProduct));

        return result.entityId;
    }
}

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
 * Saves a product via the API.
 * @param action The action containing the product to save.
 */
export function* saveProductSaga(action: ReturnType<typeof productsActions.saveProduct>): SagaGenerator {
    yield* withLoading(LoadingTargets.ActiveView, function* () {
        yield* withCallback(action.meta, function* () {
            return yield* saveProductCore(action.payload);
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
