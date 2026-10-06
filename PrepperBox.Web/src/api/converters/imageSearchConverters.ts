import * as api from "@/api/api.generated";
import ImageSearchResult from "@/models/imageSearchResult";

/**
 * Converts an ImageSearchResultDto from the API to an ImageSearchResult model.
 * @param dto The ImageSearchResultDto object from the API.
 * @returns An ImageSearchResult model object.
 */
export function convertImageSearchResultApiToModel(dto: api.ImageSearchResultDto): ImageSearchResult {
    return {
        imageUrl: dto.imageUrl,
        thumbnailUrl: dto.thumbnailUrl,
        title: dto.title,
        sourcePageUrl: dto.sourcePageUrl,
        sourceName: dto.sourceName,
        width: dto.width,
        height: dto.height
    };
}
