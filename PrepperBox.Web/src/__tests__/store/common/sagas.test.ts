import { AxiosError } from "axios";
import fakeLogger from "@testing/utils/fakeLogger";
import * as commonActions from "@/store/common/actions";
import { ErrorInfo } from "@/shared/errorInfo";
import SagaRunner from "@/__tests__/utils/sagaRunner";
import { raiseErrorSaga } from "@/store/common/sagas";
import { toastService } from "@/shared/ui/toastService";

describe("raiseErrorSaga", () => {
    afterEach(() => {
        fakeLogger.reset();
        toastService.clearMessages();
    });

    test("Given a string Then should raise an error", async () => {
        // Arrange
        const sagaRunner = new SagaRunner();
        const action = commonActions.raiseError("Error message");

        // Act
        await sagaRunner.runSaga(raiseErrorSaga, action);

        // Verify
        const toastMessages = toastService.getMessages();
        expect(toastMessages).toHaveLength(1);
        expect(toastMessages[0].detail).toBe("Error message");
        expect(toastMessages[0].severity).toBe("error");
        expect(toastMessages[0].summary).toBe("Error");
        expect(fakeLogger.errors).toHaveLength(1);
        expect(fakeLogger.errors[0].component).toBe("Saga Common");
        expect(fakeLogger.errors[0].message).toBe("Error: Error message");
        expect(fakeLogger.errors[0].args).toStrictEqual([]);
    });

    test("Given an AxiosError Then should raise an error", async () => {
        // Arrange
        const sagaRunner = new SagaRunner();
        const action = commonActions.raiseError(new AxiosError("Axios error message"));

        // Act
        await sagaRunner.runSaga(raiseErrorSaga, action);

        // Verify
        const toastMessages = toastService.getMessages();
        expect(toastMessages).toHaveLength(1);
        expect(toastMessages[0].detail).toBe("Axios error message");
        expect(toastMessages[0].severity).toBe("error");
        expect(toastMessages[0].summary).toBe("API Error");
        expect(fakeLogger.errors).toHaveLength(1);
        expect(fakeLogger.errors[0].component).toBe("Saga Common");
        expect(fakeLogger.errors[0].message).toBe("API Error: Axios error message, details: %o");
        expect(fakeLogger.errors[0].args).toStrictEqual([action.payload]);
    });

    test("Given an ErrorInfo Then should raise an error", async () => {
        // Arrange
        const sagaRunner = new SagaRunner();
        const payload: ErrorInfo = { message: "General error message", title: "General error title" };
        const action = commonActions.raiseError(payload);

        // Act
        await sagaRunner.runSaga(raiseErrorSaga, action);

        // Verify
        const toastMessages = toastService.getMessages();
        expect(toastMessages).toHaveLength(1);
        expect(toastMessages[0].detail).toBe("General error message");
        expect(toastMessages[0].severity).toBe("error");
        expect(toastMessages[0].summary).toBe("General error title");
        expect(fakeLogger.errors).toHaveLength(1);
        expect(fakeLogger.errors[0].component).toBe("Saga Common");
        expect(fakeLogger.errors[0].message).toBe("General error title: General error message");
        expect(fakeLogger.errors[0].args).toStrictEqual([]);
    });
});
