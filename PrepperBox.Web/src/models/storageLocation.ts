import { StorageLocationRef } from "./types";

/**
 * Represents a storage location.
 */
interface StorageLocation {
    id: StorageLocationRef;
    name: string;
    lastModified: string;
    dateCreated: Date;
}

export default StorageLocation;
