import { toastService } from "@hwndmaster/atom-react-prime";
import { callApi, type SagaGenerator, withCallback } from "@hwndmaster/atom-react-redux";
import apiClient from "@/api/apiAxios";
import { convertOpenFoodFactsApiToModel } from "@/api/converters/openFoodFactsConverters";
import OpenFoodFactsProduct from "@/models/openFoodFactsProduct";
import * as actions from "./actions";

/** Searches for products by their bar code */
export function* searchByBarCodeSaga(action: ReturnType<typeof actions.searchByBarCode>): SagaGenerator {
    yield* withCallback(action.meta, function* () {
        const result = yield* callApi(() => apiClient().openFoodFacts.searchByBarCode(action.payload))
            .suppressErrorLogs()
            .throwOnError(false)
            .invokeRaw();

        if (result.hasErrors) {
            if (result.statusCode === 404) {
                toastService.showWarn("Couldn't find product on OpenFoodFacts with the given bar code.");
            } else if (result.statusCode === 429) {
                toastService.showWarn("Couldn't proceed with request to OpenFoodFacts, try again later.");
            } else {
                toastService.showWarn(`OpenFoodFacts request failed (${result.statusCode}), try again later.`);
            }
            return [] as OpenFoodFactsProduct[];
        }

        const products: OpenFoodFactsProduct[] = (result.data ?? []).map(convertOpenFoodFactsApiToModel);
        return products;
    });
}
