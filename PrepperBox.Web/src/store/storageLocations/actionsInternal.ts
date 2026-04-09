import { createAction } from "@reduxjs/toolkit";
import { StorageLocationRef } from "@/models/types";
import StorageLocation from "@/models/storageLocation";

export const setStorageLocation = createAction<StorageLocation>("storageLocations/setStorageLocation");
export const setStorageLocations = createAction<StorageLocation[]>("storageLocations/setStorageLocations");
export const removeStorageLocationFromStore = createAction<StorageLocationRef>("storageLocations/removeStorageLocation");
