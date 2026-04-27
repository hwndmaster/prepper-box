
import { BaseLoadingTargets } from "@hwndmaster/atom-web-core";

/**
 * Represents the enumeration of views available under the App component.
 */
enum LoadingTargets {
    WholePage = BaseLoadingTargets.WholePage,
    ActiveView = BaseLoadingTargets.ActiveView,

    Categories = 100,
    ConsumptionLogs = 150,
    Products = 200,
    StorageLocations = 250,
    TrackedProducts = 300,
}

export default LoadingTargets;
