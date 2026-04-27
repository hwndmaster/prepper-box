import type { CommonState } from "@hwndmaster/atom-react-redux";
import * as Categories from "./categories/state";
import * as ConsumptionLogs from "./consumptionLogs/state";
import * as Products from "./products/state";
import * as StorageLocations from "./storageLocations/state";
import * as TrackedProducts from "./trackedProducts/state";

interface AppState {
    common: CommonState;
    categories: Categories.default;
    consumptionLogs: ConsumptionLogs.default;
    products: Products.default;
    storageLocations: StorageLocations.default;
    trackedProducts: TrackedProducts.default;
}

export default AppState;
