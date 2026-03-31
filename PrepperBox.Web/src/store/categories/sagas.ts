import { put } from "redux-saga/effects";
import apiClient from "@/api/apiAxios";
import { convertCategoryApiToModel } from "@/api/converters/categoryConverters";
import LoadingTargets from "@/shared/loadingTargets";
import Category from "@/models/category";
import * as api from "@/api/api.generated";
import { categoryRef } from "@/models/types";
import { callApi } from "../apiRequest";
import { SagaGenerator } from "../types";
import { withCallback, withLoading } from "../utils";
import * as categoriesActions from "./actions";
import * as categoriesActionsInternal from "./actionsInternal";

// TODO: const logger = withComponentName("Saga Categories");

/**
 * Core logic for saving a category to the API and updating the store.
 */
function* saveCategoryCore(categoryToSave: Category): SagaGenerator {
    const isNewCategory = categoryToSave.id === categoryRef.default();

    if (isNewCategory) {
        // Create new category
        const createRequest: api.CreateCategoryRequest = {
            name: categoryToSave.name,
            description: categoryToSave.description,
            iconName: categoryToSave.iconName,
        };
        const result = yield* callApi(() => apiClient().categories.categoriesPOST(createRequest))
            .invoke();

        if (result == null) {
            throw new Error("API did not return created category.");
        }

        const createdCategory: Category = {
            ...categoryToSave,
            id: result.entityId,
            lastModified: result.lastModified
        };
        yield put(categoriesActionsInternal.setCategory(createdCategory));

        return result.entityId;
    } else {
        // Update existing category
        const updateRequest: api.UpdateCategoryRequest = {
            id: categoryToSave.id,
            lastModified: categoryToSave.lastModified,
            name: categoryToSave.name,
            description: categoryToSave.description,
            iconName: categoryToSave.iconName,
        };
        const result = yield* callApi(() => apiClient().categories.categoriesPUT(updateRequest))
            .invoke();

        if (result == null) {
            throw new Error("API did not return updated category.");
        }

        const updatedCategory: Category = {
            ...categoryToSave,
            lastModified: result.lastModified
        };
        yield put(categoriesActionsInternal.setCategory(updatedCategory));

        return result.entityId;
    }
}

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
 * Saves a category via the API.
 * @param action The action containing the category to save.
 */
export function* saveCategorySaga(action: ReturnType<typeof categoriesActions.saveCategory>): SagaGenerator {
    yield* withLoading(LoadingTargets.ActiveView, function* () {
        yield* withCallback(action.meta, function* () {
            return yield* saveCategoryCore(action.payload);
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
