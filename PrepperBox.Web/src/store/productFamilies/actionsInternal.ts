import { createAction } from "@reduxjs/toolkit";
import { ProductFamilyRef } from "@/models/types";
import ProductFamily from "@/models/productFamily";

export const setProductFamily = createAction<ProductFamily>("productFamilies/setProductFamily");
export const setProductFamilies = createAction<ProductFamily[]>("productFamilies/setProductFamilies");
export const removeProductFamilyFromStore = createAction<ProductFamilyRef>("productFamilies/removeProductFamily");
