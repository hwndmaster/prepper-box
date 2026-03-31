import * as vitest from "vitest";
import { ForkEffect, takeEvery, takeLatest } from "redux-saga/effects";
import { Action, UnknownAction } from "@reduxjs/toolkit";
import { SagaHandlingType, applicationWatchers } from "@/store/setupSagas";
import AppState from "@/store/appState";
import * as store from "@/store";

// NOTE: This type has been copied from @reduxjs\toolkit\dist\index.d.ts
interface TypedActionCreator<TType extends string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (...args: any[]): Action<TType>;
    type: TType;
}

type ActionSaga<TAction extends Action = UnknownAction> = (action: TAction) => void;

// NOTE: This class is intended to be singleton. Never create more than one instance of this class.
class FakeStore {
    private underlyingStore?: store.AppStore;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly actionSagas: Map<string, ActionSaga<any>> = new Map();

    public setup(preloadedState?: Partial<AppState>): void {
        this.setupInternal(true, preloadedState);
    }

    private setupInternal(throwIfIsSetUp: boolean, preloadedState?: Partial<AppState>): void {
        if (this.underlyingStore != undefined) {
            if (throwIfIsSetUp) {
                vitest.expect.fail("The store is already set up.");
            }
            return;
        }

        const storeTuple = store.setupStore(preloadedState, true);
        this.underlyingStore = storeTuple.store;
        store.setStore(storeTuple.store, storeTuple.persistor);
        storeTuple.sagaMiddleware.run(this.watchProject);
    }

    public reset(): void {
        this.underlyingStore = undefined;
        this.actionSagas.clear();
    }

    public setupAction<TActionCreator extends TypedActionCreator<string>>(actionCreator: TActionCreator, saga: ActionSaga<ReturnType<TActionCreator>>): void {
        this.setupInternal(false);
        this.actionSagas.set(actionCreator.type, saga);
    }

    protected sagaHandler(action: Action<string>): void {
        const saga = fakeStore.actionSagas.get(action.type);
        if (saga != undefined) {
            saga(action);
        } else {
            vitest.expect.fail(`No saga handler found for action type: ${action.type}`);
        }
    }

    private *watchProject(): IterableIterator<ForkEffect<never>> {
        for (const item of applicationWatchers) {
            if (item.handlingType === SagaHandlingType.TakeLatest) {
                yield takeLatest(item.action, fakeStore.sagaHandler);
            } else if (item.handlingType === SagaHandlingType.TakeEvery) {
                yield takeEvery(item.action, fakeStore.sagaHandler);
            } else {
                throw new Error("Unexpected value of the saga handling type.");
            }
        }
    }

    public get store(): store.AppStore {
        this.setupInternal(false);
        return this.underlyingStore!;
    }
}

const fakeStore = new FakeStore();
export default fakeStore;
