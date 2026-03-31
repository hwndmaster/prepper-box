import { createAction } from "@reduxjs/toolkit";
import Product from "@/models/product";
import { ProductRef } from "@/models/types";
import { createActionWithMeta } from "../actionExtensions";

export const fetchProducts = createAction<void>("products/fetch");
export const fetchProductsByBarCode = createActionWithMeta<string, Product[]>("products/fetchByBarCode");
export const saveProduct = createActionWithMeta<Product, ProductRef>("products/saveProduct");
export const deleteProduct = createActionWithMeta<ProductRef>("products/deleteProduct");
