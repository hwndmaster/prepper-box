import { put } from "redux-saga/effects";
import { dateToTicks } from "@hwndmaster/atom-web-core";
import { callApi, withCallback, withLoading } from "@hwndmaster/atom-react-redux";
import { type SagaGenerator } from "@hwndmaster/atom-react-redux";
import apiClient from "@/api/apiAxios";
import { convertProductFamilyApiToModel } from "@/api/converters/productFamilyConverters";
import LoadingTargets from "@/shared/loadingTargets";
import ProductFamily from "@/models/productFamily";
import { UnitOfMeasure } from "@/models/unitOfMeasure";
import * as api from "@/api/api.generated";
import { typedSelect } from "../utils";
import * as productFamiliesActions from "./actions";
import * as productFamiliesActionsInternal from "./actionsInternal";
import { selectProductFamilyById } from "./selectors";

/**
 * Fetches product families from the API and updates the store.
 */
export function* fetchProductFamiliesSaga(): Generator<unknown, void, unknown> {
    yield* withLoading(LoadingTargets.ProductFamilies, function* () {
        const families: ProductFamily[] = yield* callApi(() => apiClient().productFamilies.productFamiliesAll())
            .fetchArray(convertProductFamilyApiToModel);
        yield put(productFamiliesActionsInternal.setProductFamilies(families));
    });
}

/**
 * Creates a product family via the API.
 * @param action The action containing the family to create.
 */
export function* createProductFamilySaga(action: ReturnType<typeof productFamiliesActions.createProductFamily>): SagaGenerator {
    yield* withLoading(LoadingTargets.ActiveView, function* () {
        yield* withCallback(action.meta, function* () {
            const createRequest: api.CreateProductFamilyRequest = {
                categoryId: action.payload.categoryId,
                name: action.payload.name,
                unitOfMeasure: action.payload.unitOfMeasure,
                minimumStockLevel: action.payload.minimumStockLevel,
            };
            const result = yield* callApi(() => apiClient().productFamilies.productFamiliesPOST(createRequest))
                .invoke();

            if (result == null) {
                throw new Error("API did not return created product family.");
            }

            const createdFamily: ProductFamily = {
                id: result.entityId,
                categoryId: action.payload.categoryId,
                name: action.payload.name,
                unitOfMeasure: action.payload.unitOfMeasure as UnitOfMeasure,
                minimumStockLevel: action.payload.minimumStockLevel,
                productsCount: 0,
                lastModified: result.lastModified,
                dateCreated: dateToTicks(new Date())
            };
            yield put(productFamiliesActionsInternal.setProductFamily(createdFamily));

            return result.entityId;
        });
    });
}

/**
 * Updates a product family via the API.
 * @param action The action containing the family to update.
 */
export function* updateProductFamilySaga(action: ReturnType<typeof productFamiliesActions.updateProductFamily>): SagaGenerator {
    yield* withLoading(LoadingTargets.ActiveView, function* () {
        yield* withCallback(action.meta, function* () {
            const existing: ProductFamily | undefined = yield* typedSelect(selectProductFamilyById, action.payload.id);
            if (existing == null) {
                throw new Error(`Cannot update product family with ID ${action.payload.id} because it does not exist in the store.`);
            }

            const updateRequest: api.UpdateProductFamilyRequest = {
                id: action.payload.id,
                lastModified: action.payload.lastModified,
                categoryId: action.payload.categoryId,
                name: action.payload.name,
                unitOfMeasure: action.payload.unitOfMeasure,
                minimumStockLevel: action.payload.minimumStockLevel,
            };
            const result = yield* callApi(() => apiClient().productFamilies.productFamiliesPUT(updateRequest))
                .invoke();

            if (result == null) {
                throw new Error("API did not return updated product family.");
            }

            const updatedFamily: ProductFamily = {
                ...existing,
                categoryId: action.payload.categoryId,
                name: action.payload.name,
                unitOfMeasure: action.payload.unitOfMeasure as UnitOfMeasure,
                minimumStockLevel: action.payload.minimumStockLevel,
                lastModified: result.lastModified
            };
            yield put(productFamiliesActionsInternal.setProductFamily(updatedFamily));

            return result.entityId;
        });
    });
}

/**
 * Deletes a product family via the API.
 * @param action The action containing the ID of the family to delete.
 */
export function* deleteProductFamilySaga(action: ReturnType<typeof productFamiliesActions.deleteProductFamily>): SagaGenerator {
    yield* withLoading(LoadingTargets.ActiveView, function* () {
        yield* withCallback(action.meta, function* () {
            yield* callApi(() => apiClient().productFamilies.productFamiliesDELETE(action.payload))
                .invoke();
            yield put(productFamiliesActionsInternal.removeProductFamilyFromStore(action.payload));
        });
    });
}
