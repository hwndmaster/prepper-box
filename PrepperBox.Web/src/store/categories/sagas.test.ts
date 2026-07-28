import { Common } from "@hwndmaster/atom-react-redux";
import { SagaRunner } from "@hwndmaster/atom-testing-utils";
import { vi } from "vitest";
import * as api from "@/api/api.generated";
import Category from "@/models/category";
import { CategoryRef, categoryRef } from "@/models/types";
import LoadingTargets from "@/shared/loadingTargets";
import AppState from "@/store/appState";
import { fakeAxios } from "@/utils/tests/fakeAxios";
import * as actions from "./actions";
import * as actionsInternal from "./actionsInternal";
import { createCategorySaga, deleteCategorySaga, fetchCategoriesSaga, updateCategorySaga } from "./sagas";

const sagaRunner = new SagaRunner<AppState>();

const createCategory = (overrides: Partial<Category> = {}): Category => ({
    id: categoryRef(1),
    name: "Canned food",
    description: "Food with a long shelf life",
    iconName: "pi-box",
    lastModified: 10,
    dateCreated: 1000,
    ...overrides,
});

describe("categories sagas", () => {
    beforeEach(() => {
        fakeAxios.reset();
        sagaRunner.reset();
        sagaRunner.setInitialState({ categories: { categories: [] } });
        vi.clearAllMocks();
    });

    it("fetchCategoriesSaga: fetches categories and stores them", async () => {
        // Arrange
        const categoryDto: api.CategoryDto = {
            id: categoryRef(1),
            name: "Canned food",
            description: "Food with a long shelf life",
            iconName: "pi-box",
            lastModified: 10,
            dateCreated: 1000,
        };
        fakeAxios.setupGet(api.CategoriesClient, "categoriesAll")
            .reply(200, [categoryDto]);

        // Act
        await sagaRunner.runSaga(fetchCategoriesSaga);

        // Assert
        expect(sagaRunner.dispatched).toContainEqual({ type: Common.Actions.showLoader.type, payload: LoadingTargets.Categories });
        expect(sagaRunner.findDispatchedAction(actionsInternal.setCategories)).toEqual([createCategory()]);
        expect(sagaRunner.dispatched).toContainEqual({ type: Common.Actions.hideLoader.type, payload: LoadingTargets.Categories });
    });

    it("createCategorySaga: creates a category and stores it", async () => {
        // Arrange
        const createRequest: api.CreateCategoryRequest = {
            name: "Water",
            description: "Drinking water",
            iconName: "pi-tint",
        };
        fakeAxios.setupPost(api.CategoriesClient, "categoriesPOST", { body: createRequest })
            .reply(200, { entityId: categoryRef(7), lastModified: 42 });
        const resolve = vi.fn<(value?: CategoryRef) => void>();
        const action = actions.createCategory(createRequest, undefined, resolve);

        // Act
        await sagaRunner.runSaga(createCategorySaga, action);

        // Assert
        expect(sagaRunner.dispatched).toContainEqual({ type: Common.Actions.showLoader.type, payload: LoadingTargets.ActiveView });
        expect(sagaRunner.findDispatchedAction(actionsInternal.setCategory)).toEqual({
            ...createRequest,
            id: categoryRef(7),
            lastModified: 42,
            dateCreated: expect.any(Number),
        });
        expect(resolve).toHaveBeenCalledWith(categoryRef(7));
        expect(sagaRunner.dispatched).toContainEqual({ type: Common.Actions.hideLoader.type, payload: LoadingTargets.ActiveView });
    });

    it("createCategorySaga: rejects when the API returns no result", async () => {
        // Arrange
        fakeAxios.setupPost(api.CategoriesClient, "categoriesPOST")
            .reply(200, null);
        const reject = vi.fn<(reason?: string) => void>();
        const action = actions.createCategory(
            { name: "Water", description: undefined, iconName: "pi-tint" },
            undefined,
            undefined,
            reject);

        // Act
        await sagaRunner.runSaga(createCategorySaga, action);

        // Assert
        expect(reject).toHaveBeenCalledWith("API did not return created category.");
        expect(sagaRunner.findDispatchedAction(actionsInternal.setCategory)).toBeUndefined();
    });

    it("updateCategorySaga: updates an existing category", async () => {
        // Arrange
        const existing = createCategory({ id: categoryRef(3), lastModified: 5 });
        sagaRunner.setInitialState({ categories: { categories: [existing] } });
        const updateRequest: api.UpdateCategoryRequest = {
            id: categoryRef(3),
            lastModified: 5,
            name: "Renamed",
            description: "Updated description",
            iconName: "pi-star",
        };
        fakeAxios.setupPut(api.CategoriesClient, "categoriesPUT", { body: updateRequest })
            .reply(200, { entityId: categoryRef(3), lastModified: 77 });
        const resolve = vi.fn<(value?: CategoryRef) => void>();
        const action = actions.updateCategory(updateRequest, undefined, resolve);

        // Act
        await sagaRunner.runSaga(updateCategorySaga, action);

        // Assert
        expect(sagaRunner.findDispatchedAction(actionsInternal.setCategory)).toEqual({
            ...existing,
            ...updateRequest,
            lastModified: 77,
        });
        expect(resolve).toHaveBeenCalledWith(categoryRef(3));
    });

    it("updateCategorySaga: rejects when the category is not in the store", async () => {
        // Arrange
        const reject = vi.fn<(reason?: string) => void>();
        const action = actions.updateCategory(
            {
                id: categoryRef(99),
                lastModified: 1,
                name: "Ghost",
                description: undefined,
                iconName: "pi-box",
            },
            undefined,
            undefined,
            reject);

        // Act
        await sagaRunner.runSaga(updateCategorySaga, action);

        // Assert
        expect(reject).toHaveBeenCalledWith("Cannot update category with ID 99 because it does not exist in the store.");
        expect(sagaRunner.findDispatchedAction(actionsInternal.setCategory)).toBeUndefined();
    });

    it("deleteCategorySaga: deletes the category and removes it from the store", async () => {
        // Arrange
        fakeAxios.setupDelete(api.CategoriesClient, "categoriesDELETE", { id: categoryRef(4) })
            .reply(200);
        const resolve = vi.fn<(value?: void) => void>();
        const action = actions.deleteCategory(categoryRef(4), resolve);

        // Act
        await sagaRunner.runSaga(deleteCategorySaga, action);

        // Assert
        expect(sagaRunner.dispatched).toContainEqual({ type: Common.Actions.showLoader.type, payload: LoadingTargets.ActiveView });
        expect(sagaRunner.findDispatchedAction(actionsInternal.removeCategoryFromStore)).toBe(categoryRef(4));
        expect(resolve).toHaveBeenCalled();
        expect(sagaRunner.dispatched).toContainEqual({ type: Common.Actions.hideLoader.type, payload: LoadingTargets.ActiveView });
    });
});
