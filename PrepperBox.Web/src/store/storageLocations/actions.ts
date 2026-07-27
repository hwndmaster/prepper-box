import { createAction } from "@reduxjs/toolkit";
import { createActionWithMeta, createActionWithMetaValidatable } from "@hwndmaster/atom-react-redux";
import { StorageLocationRef } from "@/models/types";
import type { StorageLocationSchemaData } from "@/schemas/storageLocationSchema";
import { CreateStorageLocationRequest, UpdateStorageLocationRequest } from "./messages";

export const fetchStorageLocations = createAction<void>("storageLocations/fetch");
export const createStorageLocation = createActionWithMetaValidatable<CreateStorageLocationRequest, StorageLocationRef, StorageLocationSchemaData>("storageLocations/createStorageLocation");
export const updateStorageLocation = createActionWithMetaValidatable<UpdateStorageLocationRequest, StorageLocationRef, StorageLocationSchemaData>("storageLocations/updateStorageLocation");
export const deleteStorageLocation = createActionWithMeta<StorageLocationRef>("storageLocations/deleteStorageLocation");
