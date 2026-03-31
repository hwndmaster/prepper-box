import { createAction } from "@reduxjs/toolkit";
import { ProductRef } from "@/models/types";
import Product from "@/models/product";

export const setProduct = createAction<Product>("products/setProduct");
export const setProducts = createAction<Product[]>("products/setProducts");
export const removeProductFromStore = createAction<ProductRef>("products/removeProduct");
