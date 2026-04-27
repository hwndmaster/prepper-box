import { createAction } from "@reduxjs/toolkit";
import { createActionWithMeta } from "@hwndmaster/atom-react-redux";
import Product from "@/models/product";
import { ProductRef } from "@/models/types";
import { CreateProductRequest, UpdateProductRequest } from "./messages";

export const fetchProducts = createAction<void>("products/fetch");
export const fetchProductsByBarCode = createActionWithMeta<string, Product[]>("products/fetchByBarCode");
export const createProduct = createActionWithMeta<CreateProductRequest, ProductRef>("products/createProduct");
export const updateProduct = createActionWithMeta<UpdateProductRequest, ProductRef>("products/updateProduct");
export const deleteProduct = createActionWithMeta<ProductRef>("products/deleteProduct");
