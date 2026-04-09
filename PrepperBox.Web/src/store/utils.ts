import { put, select } from "redux-saga/effects";
import LoadingTargets from "@/shared/loadingTargets";
import * as common from "./common";
import { ActionMeta } from "./actionExtensions";
import AppState from "./appState";

/**
 * Typed select effect that properly infers the return type of the selector.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function* typedSelect<TSelector extends (state: AppState, ...args: any[]) => unknown>(
    selector: TSelector,
    ...args: TSelector extends (state: AppState, ...args: infer TParams) => unknown ? TParams : never
): Generator<unknown, ReturnType<TSelector>, ReturnType<TSelector>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
    return yield select(selector, ...(args as any));
}

/**
 * Wraps a saga generator with loading state management.
 * @param loadingTarget The loading target to show/hide
 * @param sagaFn The saga generator function to execute
 */
export function* withLoading<T>(
    loadingTarget: LoadingTargets,
    sagaFn: () => Generator<unknown, T, unknown>
): Generator<unknown, T, unknown> {
    yield put(common.Actions.showLoader(loadingTarget));
    try {
        return yield* sagaFn();
    } finally {
        yield put(common.Actions.hideLoader(loadingTarget));
    }
}

/**
 * Wraps a saga generator with resolve/reject callbacks from action meta.
 * @param meta The action meta containing optional resolve/reject functions
 * @param sagaFn The saga generator function to execute
 */
export function* withCallback<T>(
    meta: ActionMeta<T>,
    sagaFn: () => Generator<unknown, T, unknown>
): Generator<unknown, T, unknown> {
    try {
        const result = yield* sagaFn();

        if (meta?.resolve != undefined) {
            meta.resolve(result);
        }

        return result;
    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : error?.toString() ?? "Unknown error";
        if (meta?.reject != undefined) {
            meta.reject(errorMessage);
        }
    }

    return undefined!;
}
