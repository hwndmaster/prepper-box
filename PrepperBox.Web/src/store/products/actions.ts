import { createAction } from "@reduxjs/toolkit";
import { createActionWithMeta, createActionWithMetaValidatable } from "@hwndmaster/atom-react-redux";
import Product from "@/models/product";
import { ProductRef } from "@/models/types";
import type { ProductSchemaData } from "@/schemas/productSchema";
import { CreateProductRequest, UpdateProductRequest } from "./messages";

export const fetchProducts = createAction<void>("products/fetch");
export const fetchProductsByBarCode = createActionWithMeta<string, Product[]>("products/fetchByBarCode");
export const createProduct = createActionWithMetaValidatable<CreateProductRequest, ProductRef, ProductSchemaData>("products/createProduct");
export const updateProduct = createActionWithMetaValidatable<UpdateProductRequest, ProductRef, ProductSchemaData>("products/updateProduct");
export const deleteProduct = createActionWithMeta<ProductRef>("products/deleteProduct");
