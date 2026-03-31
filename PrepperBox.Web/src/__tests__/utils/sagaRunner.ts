import { runSaga, Saga } from "redux-saga";
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { AppState } from "@/store";

interface DispatchedAction {
    type: string;
    payload: unknown;
}

/**
 * Utility class to run sagas in tests and capture dispatched actions and errors.
 */
class SagaRunner {
    private readonly dispatchedActions: DispatchedAction[] = [];
    private readonly errorsOccurred: string[] = [];
    private initialState: AppState | undefined = undefined;

    /**
     * Runs the given saga with the provided payload.
     * @param saga The saga to run.
     * @param payload The payload to pass to the saga.
     */
    public async runSaga(saga: Saga, ...payload: unknown[]): Promise<void> {
        try {
            await runSaga({
                dispatch: (action) => {
                    if (action != null
                        && typeof action === "object"
                        && "type" in action) {
                        this.dispatchedActions.push({
                            type: action.type as string,
                            payload: "payload" in action ? action.payload : undefined,
                        });
                    } else {
                        throw new Error("Invalid action dispatched.");
                    }
                },
                getState: () => this.initialState,
            }, saga, ...payload).toPromise();
        } catch (error) {
            this.errorsOccurred.push((error ?? "").toString());
        }
    }

    /**
     * Sets the initial state for the saga runner.
     * @param state The initial application state.
     */
    public setInitialState(state: AppState): void {
        this.initialState = state;
    }

    /**
     * Clears all dispatched actions and errors from previous saga runs.
     * Useful when reusing the same SagaRunner instance across multiple tests.
     */
    public reset(): void {
        this.dispatchedActions.length = 0;
        this.errorsOccurred.length = 0;
    }

    /**
     * Finds a dispatched action by its action creator.
     * @param action The action creator to search for.
     * @returns The payload of the found action, or undefined if not found.
     */
    public findDispatchedAction<TPayload>(action: ActionCreatorWithPayload<TPayload, string>): TPayload | undefined {
        const found = this.dispatchedActions.find((dispatchedAction) => dispatchedAction.type === action.type);
        if (found != undefined) {
            return found.payload as TPayload;
        }
        return undefined;
    }

    /**
     * Gets the list of dispatched actions.
     */
    public get dispatched(): Readonly<DispatchedAction[]> {
        return this.dispatchedActions;
    }

    /**
     * Gets the list of errors that occurred during saga execution.
     */
    public get errors(): Readonly<string[]> {
        return this.errorsOccurred;
    }
}

export default SagaRunner;
