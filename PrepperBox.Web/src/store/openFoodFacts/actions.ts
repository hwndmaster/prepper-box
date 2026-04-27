import { createActionWithMeta } from "@hwndmaster/atom-react-redux";
import OpenFoodFactsProduct from "@/models/openFoodFactsProduct";

export const searchByBarCode = createActionWithMeta<string, OpenFoodFactsProduct[]>("openFoodFacts/searchByBarCode");
