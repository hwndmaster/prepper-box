import { toastService } from "@hwndmaster/atom-react-prime";
import { SagaRunner } from "@hwndmaster/atom-testing-utils";
import { vi } from "vitest";
import * as api from "@/api/api.generated";
import OpenFoodFactsProduct from "@/models/openFoodFactsProduct";
import { UnitOfMeasure } from "@/models/unitOfMeasure";
import AppState from "@/store/appState";
import { fakeAxios } from "@/utils/tests/fakeAxios";
import * as actions from "./actions";
import { searchByBarCodeSaga } from "./sagas";

const sagaRunner = new SagaRunner<AppState>();

describe("openFoodFacts sagas", () => {
    beforeEach(() => {
        fakeAxios.reset();
        sagaRunner.reset();
        vi.restoreAllMocks();
    });

    it("searchByBarCodeSaga: resolves with the converted products", async () => {
        // Arrange
        const productDto: api.OpenFoodFactsProductDto = {
            code: "5000157024671",
            productName: "Baked Beans",
            brands: "Heinz",
            quantity: 415,
            unitOfMeasure: UnitOfMeasure.Kilogram,
            imageUrl: "https://example.org/large.jpg",
            imageSmallUrl: "https://example.org/small.jpg",
        };
        fakeAxios.setupGet(api.OpenFoodFactsClient, "searchByBarCode", { barCode: "5000157024671" })
            .reply(200, [productDto]);
        const resolve = vi.fn<(value?: OpenFoodFactsProduct[]) => void>();
        const action = actions.searchByBarCode("5000157024671", resolve);

        // Act
        await sagaRunner.runSaga(searchByBarCodeSaga, action);

        // Assert
        expect(resolve).toHaveBeenCalledWith([
            {
                barCode: "5000157024671",
                productName: "Baked Beans",
                brands: "Heinz",
                quantity: 415,
                unitOfMeasure: UnitOfMeasure.Kilogram,
                imageUrl: "https://example.org/large.jpg",
                imageSmallUrl: "https://example.org/small.jpg",
            },
        ]);
    });

    it("searchByBarCodeSaga: warns and resolves empty when the bar code is unknown", async () => {
        // Arrange
        const showWarn = vi.spyOn(toastService, "showWarn").mockImplementation(() => undefined);
        fakeAxios.setupGet(api.OpenFoodFactsClient, "searchByBarCode", { barCode: "0000000000000" })
            .reply(404);
        const resolve = vi.fn<(value?: OpenFoodFactsProduct[]) => void>();
        const action = actions.searchByBarCode("0000000000000", resolve);

        // Act
        await sagaRunner.runSaga(searchByBarCodeSaga, action);

        // Assert
        expect(showWarn).toHaveBeenCalledWith("Couldn't find product on OpenFoodFacts with the given bar code.");
        expect(resolve).toHaveBeenCalledWith([]);
    });

    it("searchByBarCodeSaga: warns about throttling when the request is rate limited", async () => {
        // Arrange
        const showWarn = vi.spyOn(toastService, "showWarn").mockImplementation(() => undefined);
        fakeAxios.setupGet(api.OpenFoodFactsClient, "searchByBarCode", { barCode: "5000157024671" })
            .reply(429);
        const resolve = vi.fn<(value?: OpenFoodFactsProduct[]) => void>();
        const action = actions.searchByBarCode("5000157024671", resolve);

        // Act
        await sagaRunner.runSaga(searchByBarCodeSaga, action);

        // Assert
        expect(showWarn).toHaveBeenCalledWith("Couldn't proceed with request to OpenFoodFacts, try again later.");
        expect(resolve).toHaveBeenCalledWith([]);
    });

    it("searchByBarCodeSaga: warns with the status code for any other failure", async () => {
        // Arrange
        const showWarn = vi.spyOn(toastService, "showWarn").mockImplementation(() => undefined);
        fakeAxios.setupGet(api.OpenFoodFactsClient, "searchByBarCode", { barCode: "5000157024671" })
            .reply(500);
        const resolve = vi.fn<(value?: OpenFoodFactsProduct[]) => void>();
        const action = actions.searchByBarCode("5000157024671", resolve);

        // Act
        await sagaRunner.runSaga(searchByBarCodeSaga, action);

        // Assert
        expect(showWarn).toHaveBeenCalledWith("OpenFoodFacts request failed (500), try again later.");
        expect(resolve).toHaveBeenCalledWith([]);
    });
});
