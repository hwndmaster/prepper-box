import { toastService } from "@hwndmaster/atom-react-prime";
import { SagaRunner } from "@hwndmaster/atom-testing-utils";
import { vi } from "vitest";
import * as api from "@/api/api.generated";
import ImageSearchResult from "@/models/imageSearchResult";
import AppState from "@/store/appState";
import { fakeAxios } from "@/utils/tests/fakeAxios";
import * as actions from "./actions";
import { searchImagesSaga } from "./sagas";

const sagaRunner = new SagaRunner<AppState>();
const Query = "Heinz Baked Beans";

describe("imageSearch sagas", () => {
    beforeEach(() => {
        fakeAxios.reset();
        sagaRunner.reset();
        vi.restoreAllMocks();
    });

    it("searchImagesSaga: resolves with the converted images", async () => {
        // Arrange
        const imageDto: api.ImageSearchResultDto = {
            imageUrl: "https://shop.example.org/beans.jpg",
            thumbnailUrl: "https://serpapi.example.org/thumbs/1.jpeg",
            title: "Heinz Baked Beans 415g",
            sourcePageUrl: "https://shop.example.org/products/beans",
            sourceName: "Example Shop",
            width: 1200,
            height: 900,
        };
        fakeAxios.setupGet(api.ImageSearchClient, "searchImages", { query: Query }).reply(200, [imageDto]);
        const resolve = vi.fn<(value?: ImageSearchResult[]) => void>();
        const action = actions.searchImages(Query, resolve);

        // Act
        await sagaRunner.runSaga(searchImagesSaga, action);

        // Assert
        expect(resolve).toHaveBeenCalledWith([
            {
                imageUrl: "https://shop.example.org/beans.jpg",
                thumbnailUrl: "https://serpapi.example.org/thumbs/1.jpeg",
                title: "Heinz Baked Beans 415g",
                sourcePageUrl: "https://shop.example.org/products/beans",
                sourceName: "Example Shop",
                width: 1200,
                height: 900,
            },
        ]);
    });

    it.each([
        [503, "Image search is not configured on the server."],
        [429, "The image search limit has been reached, try again later."],
        [502, "Image search failed (502), try again later."],
    ])("searchImagesSaga: warns and rejects when the search answers %i", async (statusCode, message) => {
        // Arrange
        const showWarn = vi.spyOn(toastService, "showWarn").mockImplementation(() => undefined);
        fakeAxios.setupGet(api.ImageSearchClient, "searchImages", { query: Query }).reply(statusCode);
        const resolve = vi.fn<(value?: ImageSearchResult[]) => void>();
        const reject = vi.fn<(reason?: string) => void>();
        const action = actions.searchImages(Query, resolve, reject);

        // Act
        await sagaRunner.runSaga(searchImagesSaga, action);

        // Assert
        expect(showWarn).toHaveBeenCalledWith(message);
        expect(reject).toHaveBeenCalledWith(message);
        expect(resolve).not.toHaveBeenCalled();
    });
});
