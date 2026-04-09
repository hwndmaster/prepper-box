import { AxiosInstance } from "axios";
import * as api from "./api.generated";

interface ApiClient {
    categories: api.CategoriesClient;
    consumptionLogs: api.ConsumptionLogsClient;
    products: api.ProductsClient;
    storageLocations: api.StorageLocationsClient;
    trackedProducts: api.TrackedProductsClient;
}
let axiosInstance: AxiosInstance | null = null;
let client: ApiClient | null = null;

const setApiAxiosInstance = (instance: AxiosInstance): void => {
    axiosInstance = instance;
};

const getApiAxiosInstance = (): AxiosInstance => {
    if (axiosInstance == null) {
        throw new Error("The API Axios instance has not been initialized yet.");
    }

    return axiosInstance;
};

const apiClient = (): ApiClient => {
    client ??= {
        categories: new api.CategoriesClient("", getApiAxiosInstance()),
        consumptionLogs: new api.ConsumptionLogsClient("", getApiAxiosInstance()),
        products: new api.ProductsClient("", getApiAxiosInstance()),
        storageLocations: new api.StorageLocationsClient("", getApiAxiosInstance()),
        trackedProducts: new api.TrackedProductsClient("", getApiAxiosInstance()),
    };

    return client;
};

export default apiClient;
export { setApiAxiosInstance, getApiAxiosInstance };
