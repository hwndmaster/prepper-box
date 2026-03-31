import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import * as logger from "../shared/logger";
import { ApiTimeoutMs } from "./constants";

class AxiosInstanceFactory {
    readonly logger: logger.Logger;
    private timeout: number = ApiTimeoutMs;

    constructor(private readonly baseUrl: string, apiName?: string) {
        this.logger = logger.withComponentName(apiName ?? baseUrl);
    }

    withTimeout(timeout: number): AxiosInstanceFactory {
        this.timeout = timeout;
        return this;
    }

    build(): AxiosInstance {
        const axiosInstance: AxiosInstance = axios.create({
            baseURL: this.baseUrl,
            timeout: this.timeout,
        });

        axiosInstance.interceptors.request.use(
            async (requestConfig) => {
                if (requestConfig.data != null) {
                    requestConfig.headers["Content-Type"] = "application/json; charset=utf-8";
                }
                return requestConfig;
            },
            async (error: AxiosError) => {
                this.logger.error(error);
                return Promise.reject(error);
            }
        );

        axiosInstance.interceptors.response.use(
            (responseConfig: AxiosResponse) => {
                return responseConfig;
            },
            async (error: AxiosError) => {
                this.logger.error(error);
                return Promise.reject(error);
            }
        );

        return axiosInstance;
    }
}

export default AxiosInstanceFactory;
