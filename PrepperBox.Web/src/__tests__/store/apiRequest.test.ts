import { put } from "redux-saga/effects";
import { ApiResponse } from "@/api/apiResponse";
import { callApi } from "@/store/apiRequest";
import fakeAxios from "../utils/fakeAxios";
import SagaRunner from "../utils/sagaRunner";

const TestEndpoint = "TestEndpoint";

describe("callApi", () => {
    test("Given the api action Then should call it and return the response", async () => {
        // Arrange
        const sagaRunner = new SagaRunner();
        fakeAxios.setupAxiosEndpoint((axiosMock) => {
            axiosMock.onGet(TestEndpoint).reply(200, "TestResponse");
        });

        // Act
        await sagaRunner.runSaga(callApiSaga);

        // Verify
        expect(sagaRunner.dispatched).toHaveLength(1);
        expect(sagaRunner.dispatched[0]).toEqual({ type: "DUMMY_ACTION", payload: "TestResponse" });
    });

    test("Given 204 status and returnNullOn(204) Then should return null", async () => {
        // Arrange
        const sagaRunner = new SagaRunner();
        fakeAxios.setupAxiosEndpoint((axiosMock) => {
            axiosMock.onGet(TestEndpoint).reply(204);
        });

        // Act
        await sagaRunner.runSaga(callApiNullableSaga);

        // Verify
        expect(sagaRunner.dispatched).toHaveLength(1);
        expect(sagaRunner.dispatched[0]).toEqual({ type: "DUMMY_ACTION", payload: null });
    });
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function* callApiSaga(): Generator<any, any, any> {
    const response = yield* callApi(async () => dummyApiCall()).invoke();
    yield put({ type: "DUMMY_ACTION", payload: response });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function* callApiNullableSaga(): Generator<any, any, any> {
    const response = yield* callApi(async () => dummyApiCall())
        .returnNullOn(204)
        .invoke();
    yield put({ type: "DUMMY_ACTION", payload: response });
}

async function dummyApiCall(): Promise<ApiResponse<string>> {
    return fakeAxios.axiosInstance.get(TestEndpoint);
}
