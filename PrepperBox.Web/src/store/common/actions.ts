import { createAction } from "@reduxjs/toolkit";
import { RaiseErrorInfo } from "@/shared/errorInfo";
import LoadingTargets from "@/shared/loadingTargets";

export const showLoader = createAction<LoadingTargets>("common/showLoader");
export const hideLoader = createAction<LoadingTargets>("common/hideLoader");
export const hideAllLoaders = createAction<void>("common/hideAllLoaders");
export const raiseError = createAction<RaiseErrorInfo>("common/raiseError");
