import apiClient from "@/api/apiAxios";
import { convertOpenFoodFactsApiToModel } from "@/api/converters/openFoodFactsConverters";
import OpenFoodFactsProduct from "@/models/openFoodFactsProduct";
import { callApi } from "../apiRequest";
import { SagaGenerator } from "../types";
import { withCallback } from "../utils";
import * as actions from "./actions";

/** Searches for products by their bar code */
export function* searchByBarCodeSaga(action: ReturnType<typeof actions.searchByBarCode>): SagaGenerator {
    yield* withCallback(action.meta, function* () {
        const products: OpenFoodFactsProduct[] = yield* callApi(() => apiClient().openFoodFacts.searchByBarCode(action.payload))
            .fetchArray(convertOpenFoodFactsApiToModel);
        return products;
    });
}
