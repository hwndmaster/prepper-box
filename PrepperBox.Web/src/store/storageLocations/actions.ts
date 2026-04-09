import { createAction } from "@reduxjs/toolkit";
import { CreateStorageLocationRequest, UpdateStorageLocationRequest } from "@/api/api.generated";
import { StorageLocationRef } from "@/models/types";
import { createActionWithMeta } from "../actionExtensions";

export const fetchStorageLocations = createAction<void>("storageLocations/fetch");
export const createStorageLocation = createActionWithMeta<CreateStorageLocationRequest, StorageLocationRef>("storageLocations/createStorageLocation");
export const updateStorageLocation = createActionWithMeta<UpdateStorageLocationRequest, StorageLocationRef>("storageLocations/updateStorageLocation");
export const deleteStorageLocation = createActionWithMeta<StorageLocationRef>("storageLocations/deleteStorageLocation");
