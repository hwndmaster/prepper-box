import { toastService } from "@hwndmaster/atom-react-prime";
import { callApi, type SagaGenerator, withCallback } from "@hwndmaster/atom-react-redux";
import apiClient from "@/api/apiAxios";
import { convertImageSearchResultApiToModel } from "@/api/converters/imageSearchConverters";
import ImageSearchResult from "@/models/imageSearchResult";
import * as actions from "./actions";

function describeSearchFailure(statusCode: number): string {
    switch (statusCode) {
        case 503:
            return "Image search is not configured on the server.";
        case 429:
            return "The image search limit has been reached, try again later.";
        default:
            return `Image search failed (${statusCode}), try again later.`;
    }
}

/**
 * Searches the web for images to pick a product image from. Rejects when the search fails, so the
 * caller can tell a failure apart from a search that found nothing.
 */
export function* searchImagesSaga(action: ReturnType<typeof actions.searchImages>): SagaGenerator {
    yield* withCallback(action.meta, function* () {
        const result = yield* callApi(() => apiClient().imageSearch.searchImages(action.payload))
            .suppressErrorLogs()
            .throwOnError(false)
            .invokeRaw();

        if (result.hasErrors) {
            const message = describeSearchFailure(result.statusCode);
            toastService.showWarn(message);
            throw new Error(message);
        }

        const images: ImageSearchResult[] = (result.data ?? []).map(convertImageSearchResultApiToModel);
        return images;
    });
}
