import axios, { AxiosInstance } from "axios";
import MockAdapter from "axios-mock-adapter";
import { setApiAxiosInstance } from "@/api/apiAxios";

type GetReplyDescriptor = ReturnType<MockAdapter["onGet"]>;
type ParamPrimitive = string | number | boolean;
type ParamValue = ParamPrimitive | ParamPrimitive[] | null | undefined;

/**
 * A fake Axios instance for testing purposes.
 */
class FakeAxios {
    private readonly currentAxiosInstance: AxiosInstance;
    private readonly axiosMock: MockAdapter;

    constructor() {
        this.currentAxiosInstance = axios.create();
        this.axiosMock = new MockAdapter(this.currentAxiosInstance);

        setApiAxiosInstance(this.currentAxiosInstance);
    }

    /**
     * Resets all the configured mocks.
     */
    public reset(): void {
        this.axiosMock.reset();
    }

    /**
     * Sets up an endpoint with the given axios mock adapter passed in.
     * @param handler The handler to set up the endpoint with the axios mock adapter.
     */
    public setupAxiosEndpoint(handler: (axiosMock: MockAdapter) => void): void {
        handler(this.axiosMock);
    }

    /**
     * Sets up a GET request mock for the given client and operation.
     * @example
     * ```typescript
     * fakeAxios.setupGet(processingApi.DataSetInformationClient, "GetForSessions", {
     *     WorkspaceRef: workspaceRef,
     *     Data: sessionRefs
     *   }).reply(200, [...]);
     * ```
     * @param client The API client.
     * @param operation The operation name, provided by the client.
     * @param params The operation parameters.
     * @returns The GET reply descriptor, to be used to set up the `reply`.
     */
    public setupGet<TClient extends {
        operations: Record<string, string>;
        operationParams: Record<string, Record<string, ParamValue>>;
    }, TOperation extends keyof TClient["operationParams"] & keyof TClient["operations"]>(
        client: TClient,
        operation: TOperation & string,
        params?: TClient["operationParams"][TOperation]
    ): GetReplyDescriptor {
        let url = client.operations[operation];
        if (params != null) {
            url += "?";
            Object.keys(params).forEach(key => {
                const value = params[key];
                if (value == null) {
                    return;
                }
                if (url.includes(`{${key}}`)) {
                    // If the parameter is part of the URL route (before `?` sign), it is never an array
                    const valueStr = String(value);
                    url = url.replace(new RegExp("{" + key + "}", "g"), encodeURIComponent(valueStr));
                } else {
                    const items = Array.isArray(value) ? value : [value];
                    items.forEach((item) => {
                        url += `${key}=`;
                        url += encodeURIComponent(item);
                        url += "&";
                    });
                }
            });

            url = url.slice(0, -1); // Remove trailing '&'
        }

        return this.axiosMock.onGet(url);
    }

    /**
     * Gets the current Axios instance.
     */
    get axiosInstance(): AxiosInstance {
        return this.currentAxiosInstance;
    }
}

const fakeAxios = new FakeAxios();

export default fakeAxios;
