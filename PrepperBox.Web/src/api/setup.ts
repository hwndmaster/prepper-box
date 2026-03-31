import { ApiUrl } from "@/shared/constants";
import AxiosInstanceFactory from "./axiosInstanceFactory";
import { setApiAxiosInstance } from "./apiAxios";

/**
 * Sets up Axios instances.
 */
export function setupAxiosInstances(): void {
    setApiAxiosInstance(new AxiosInstanceFactory(ApiUrl, "Api").build());
}
