import { NavigateFunction, Location as ReactLocation } from "react-router-dom";
import { productRef } from "@/models/types";

interface RouteDefinition {
    path: string;
    defaultParams: Record<string, unknown>;
    state?: Record<string, unknown>;
}

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
 * Creates a route string from a route definition and parameters.
 * @param route The route.
 * @param params The parameters.
 * @returns The route.
 */
function getRouteWithParameters<TRoute extends RouteDefinition>(
    route: TRoute,
    params?: TRoute["defaultParams"]
): string {
    params = { ...route.defaultParams, ...params };
    return route.path.replace(/:(\w+)/g, (_match: string, paramName: string) => params[paramName]!.toString());
}

/**
 * Navigates to a route with the given parameters.
 * @param navigate The navigate function.
 * @param route The route to navigate to.
 * @param params The parameters to use in the route.
 */
async function goTo<TRoute extends RouteDefinition>(
    navigate: NavigateFunction,
    route: TRoute,
    params?: TRoute["defaultParams"],
    state?: TRoute["state"]
): Promise<void> {
    await navigate(getRouteWithParameters(route, params), { state });
}

/**
 * Returns the current route definition from the location object, given with @see useLocation().
 * @param location The location object.
 * @returns The route definition associated with the current location.
 */
function getCurrentRoute(location: Location | ReactLocation): RouteDefinition | null {
    const appRoutesDict = AppRoutes as Record<string, RouteDefinition>;
    const routeDefinition = Object.keys(AppRoutes).find((routeKey) => {
        const route = appRoutesDict[routeKey];

        // Trim out `/` symbol at the end:
        const normalizedPath = location.pathname.length > 2
            ? location.pathname.replace(/\/$/, "")
            : location.pathname;

        const re = new RegExp(route.path.replace(/:(\w)+/g, "([^/]+)") + "$", "g");
        return re.test(normalizedPath);
    });

    if (routeDefinition == null) {
        return null;
    }

    return appRoutesDict[routeDefinition];
}

export default AppRoutes;
export { getRouteWithParameters, getCurrentRoute, goTo };
