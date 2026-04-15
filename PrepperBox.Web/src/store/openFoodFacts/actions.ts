import OpenFoodFactsProduct from "@/models/openFoodFactsProduct";
import { createActionWithMeta } from "../actionExtensions";

export const searchByBarCode = createActionWithMeta<string, OpenFoodFactsProduct[]>("openFoodFacts/searchByBarCode");
