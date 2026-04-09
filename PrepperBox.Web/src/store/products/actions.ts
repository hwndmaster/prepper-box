import { createAction } from "@reduxjs/toolkit";
import { CreateProductRequest, UpdateProductRequest } from "@/api/api.generated";
import Product from "@/models/product";
import { ProductRef } from "@/models/types";
import { createActionWithMeta } from "../actionExtensions";

export const fetchProducts = createAction<void>("products/fetch");
export const fetchProductsByBarCode = createActionWithMeta<string, Product[]>("products/fetchByBarCode");
export const createProduct = createActionWithMeta<CreateProductRequest, ProductRef>("products/createProduct");
export const updateProduct = createActionWithMeta<UpdateProductRequest, ProductRef>("products/updateProduct");
export const deleteProduct = createActionWithMeta<ProductRef>("products/deleteProduct");
