import * as api from "@/api/api.generated";
import StorageLocation from "@/models/storageLocation";

/**
 * Converts an API StorageLocationDto to a StorageLocation model.
 * @param apiStorageLocation The StorageLocationDto from the API.
 * @returns The converted StorageLocation model.
 */
export function convertStorageLocationApiToModel(apiStorageLocation: api.StorageLocationDto): StorageLocation {
    return {
        id: apiStorageLocation.id,
        name: apiStorageLocation.name,
        lastModified: apiStorageLocation.lastModified,
        dateCreated: apiStorageLocation.dateCreated
    };
}
