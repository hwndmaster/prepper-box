import { StorageLocationRef } from "./types";

/**
 * Represents a storage location.
 */
interface StorageLocation {
    id: StorageLocationRef;
    name: string;
    lastModified: number;
    dateCreated: number;
}

export default StorageLocation;
