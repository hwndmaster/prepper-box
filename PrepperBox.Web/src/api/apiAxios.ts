import { AxiosInstance } from "axios";
import * as api from "./api.generated";

interface ApiClient {
    categories: api.CategoriesClient;
    products: api.ProductsClient;
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
        products: new api.ProductsClient("", getApiAxiosInstance()),
        trackedProducts: new api.TrackedProductsClient("", getApiAxiosInstance()),
    };

    return client;
};

export default apiClient;
export { setApiAxiosInstance, getApiAxiosInstance };
