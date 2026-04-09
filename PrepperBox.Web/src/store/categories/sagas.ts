import { put } from "redux-saga/effects";
import apiClient from "@/api/apiAxios";
import { convertCategoryApiToModel } from "@/api/converters/categoryConverters";
import LoadingTargets from "@/shared/loadingTargets";
import { dateToTicks } from "@/shared/helper";
import Category from "@/models/category";
import * as api from "@/api/api.generated";
import { callApi } from "../apiRequest";
import { SagaGenerator } from "../types";
import { typedSelect, withCallback, withLoading } from "../utils";
import * as categoriesActions from "./actions";
import * as categoriesActionsInternal from "./actionsInternal";
import { selectCategoryById } from "./selectors";

// TODO: const logger = withComponentName("Saga Categories");

/**
 * Fetches categories from the API and updates the store.
 */
export function* fetchCategoriesSaga(): Generator<unknown, void, unknown> {
    yield* withLoading(LoadingTargets.Categories, function* () {
        const categories: Category[] = yield* callApi(() => apiClient().categories.categoriesAll())
            .fetchArray(convertCategoryApiToModel);
        yield put(categoriesActionsInternal.setCategories(categories));
    });
}

/**
 * Creates a category via the API.
 * @param action The action containing the category to create.
 */
export function* createCategorySaga(action: ReturnType<typeof categoriesActions.createCategory>): SagaGenerator {
    yield* withLoading(LoadingTargets.ActiveView, function* () {
        yield* withCallback(action.meta, function* () {
            const createRequest: api.CreateCategoryRequest = {
                name: action.payload.name,
                description: action.payload.description,
                iconName: action.payload.iconName,
            };
            const result = yield* callApi(() => apiClient().categories.categoriesPOST(createRequest))
                .invoke();

            if (result == null) {
                throw new Error("API did not return created category.");
            }

            const createdCategory: Category = {
                ...action.payload,
                description: createRequest.description,
                id: result.entityId,
                lastModified: result.lastModified,
                dateCreated: dateToTicks(new Date())
            };
            yield put(categoriesActionsInternal.setCategory(createdCategory));

            return result.entityId;
        });
    });
}

/**
 * Updates a category via the API.
 * @param action The action containing the category to update.
 */
export function* updateCategorySaga(action: ReturnType<typeof categoriesActions.updateCategory>): SagaGenerator {
    yield* withLoading(LoadingTargets.ActiveView, function* () {
        yield* withCallback(action.meta, function* () {
            const existing: Category | undefined = yield* typedSelect(selectCategoryById, action.payload.id);
            if (existing == null) {
                throw new Error(`Cannot update category with ID ${action.payload.id} because it does not exist in the store.`);
            }

            const updateRequest: api.UpdateCategoryRequest = {
                id: action.payload.id,
                lastModified: action.payload.lastModified,
                name: action.payload.name,
                description: action.payload.description,
                iconName: action.payload.iconName,
            };
            const result = yield* callApi(() => apiClient().categories.categoriesPUT(updateRequest))
                .invoke();

            if (result == null) {
                throw new Error("API did not return updated category.");
            }

            const updatedCategory: Category = {
                ...existing,
                ...action.payload,
                lastModified: result.lastModified
            };
            yield put(categoriesActionsInternal.setCategory(updatedCategory));

            return result.entityId;
        });
    });
}

/**
 * Deletes a category via the API.
 * @param action The action containing the ID of the category to delete.
 */
export function* deleteCategorySaga(action: ReturnType<typeof categoriesActions.deleteCategory>): SagaGenerator {
    yield* withLoading(LoadingTargets.ActiveView, function* () {
        yield* withCallback(action.meta, function* () {
            yield* callApi(() => apiClient().categories.categoriesDELETE(action.payload))
                .invoke();
            yield put(categoriesActionsInternal.removeCategoryFromStore(action.payload));
        });
    });
}
