import * as Common from "./common/state";
import * as Categories from "./categories/state";
import * as ConsumptionLogs from "./consumptionLogs/state";
import * as Products from "./products/state";
import * as TrackedProducts from "./trackedProducts/state";

interface AppState {
    common: Common.default;
    categories: Categories.default;
    consumptionLogs: ConsumptionLogs.default;
    products: Products.default;
    trackedProducts: TrackedProducts.default;
}

export default AppState;
