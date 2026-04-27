import { Location as ReactLocation } from "react-router-dom";
import { getCurrentRoute as getCurrentRouteBase, type RouteDefinition } from "@hwndmaster/atom-react-core";
import { productRef } from "@/models/types";

const AppRoutes = {
    Default: {
        path: "/",
        defaultParams: {},
        state: {
            selectedCategoryId: 0,
        },
    },
    Categories: {
        path: "/categories",
        defaultParams: {},
    },
    StorageLocations: {
        path: "/storage-locations",
        defaultParams: {},
    },
    AddProduct: {
        path: "/add-product",
        defaultParams: {},
        state: {
            barCode: "",
            selectedCategoryId: 0,
        },
    },
    EditProduct: {
        path: "/edit-product/:productId",
        defaultParams: {
            productId: productRef(0),
        },
        state: {
            selectedCategoryId: 0,
        },
    },
    AddTrackedProduct: {
        path: "/add-tracked-product/:productId",
        defaultParams: {
            productId: productRef(0),
        },
        state: {
            selectedCategoryId: 0,
        },
    },
    ConsumptionLogs: {
        path: "/consumption-logs",
        defaultParams: {},
    },
};

/**
 * Finds the first matching app route for the current browser location.
 */
function getCurrentRoute(location: Location | ReactLocation): RouteDefinition | null {
    return getCurrentRouteBase(AppRoutes as Record<string, RouteDefinition>, location);
}

export default AppRoutes;
export { getCurrentRoute };
