import { put } from "redux-saga/effects";
import { dateToTicks } from "@hwndmaster/atom-web-core";
import { callApi, withCallback, withLoading, withValidatableCallback } from "@hwndmaster/atom-react-redux";
import { type SagaGenerator } from "@hwndmaster/atom-react-redux";
import apiClient from "@/api/apiAxios";
import { convertProductApiToModel } from "@/api/converters/productConverters";
import { mapProductValidationField } from "@/api/fieldMapping/productFieldMapping";
import LoadingTargets from "@/shared/loadingTargets";
import Product from "@/models/product";
import { categoryRef } from "@/models/types";
import * as api from "@/api/api.generated";
import { typedSelect } from "../utils";
import { selectProductFamilyById } from "../productFamilies/selectors";
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
        yield* withValidatableCallback(action.meta, { mapValidationField: mapProductValidationField }, function* () {
            const createRequest: api.CreateProductRequest = {
                name: action.payload.name,
                description: action.payload.description,
                familyId: action.payload.familyId,
                manufacturer: action.payload.manufacturer,
                barCode: action.payload.barCode,
                imageUrl: action.payload.imageUrl,
                imageSmallUrl: action.payload.imageSmallUrl,
            };
            const result = yield* callApi(() => apiClient().products.productsPOST(createRequest))
                .invoke();

            if (result == null) {
                throw new Error("API did not return created product.");
            }

            // Category, unit and minimum stock are derived from the family for display.
            const family = yield* typedSelect(selectProductFamilyById, action.payload.familyId);
            const createdProduct: Product = {
                ...action.payload,
                id: result.entityId,
                categoryId: family?.categoryId ?? categoryRef.default(),
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
        yield* withValidatableCallback(action.meta, { mapValidationField: mapProductValidationField }, function* () {
            const existing: Product | undefined = yield* typedSelect(selectProductById, action.payload.id);
            if (existing == null) {
                throw new Error(`Cannot update product with ID ${action.payload.id} because it does not exist in the store.`);
            }

            const updateRequest: api.UpdateProductRequest = {
                id: action.payload.id,
                lastModified: action.payload.lastModified,
                name: action.payload.name,
                description: action.payload.description,
                familyId: action.payload.familyId,
                manufacturer: action.payload.manufacturer,
                barCode: action.payload.barCode,
                imageUrl: action.payload.imageUrl,
                imageSmallUrl: action.payload.imageSmallUrl,
            };
            const result = yield* callApi(() => apiClient().products.productsPUT(updateRequest))
                .invoke();

            if (result == null) {
                throw new Error("API did not return updated product.");
            }

            // The family may have changed, so re-derive category, unit and minimum stock from it.
            const family = yield* typedSelect(selectProductFamilyById, action.payload.familyId);
            const updatedProduct: Product = {
                ...existing,
                ...action.payload,
                categoryId: family?.categoryId ?? existing.categoryId,
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
