import { createAction } from "@reduxjs/toolkit";
import { createActionWithMeta } from "@hwndmaster/atom-react-redux";
import { StorageLocationRef } from "@/models/types";
import { CreateStorageLocationRequest, UpdateStorageLocationRequest } from "./messages";

export const fetchStorageLocations = createAction<void>("storageLocations/fetch");
export const createStorageLocation = createActionWithMeta<CreateStorageLocationRequest, StorageLocationRef>("storageLocations/createStorageLocation");
export const updateStorageLocation = createActionWithMeta<UpdateStorageLocationRequest, StorageLocationRef>("storageLocations/updateStorageLocation");
export const deleteStorageLocation = createActionWithMeta<StorageLocationRef>("storageLocations/deleteStorageLocation");
