import React, { PropsWithChildren } from "react";
import { Router } from "react-router-dom";
import * as testReact from "@testing-library/react";
import { Provider } from "react-redux";
import { JSX } from "react/jsx-runtime";
import fakeStore from "./fakeStore";
import * as fakeRouter from "./fakeRouter";

// This type interface extends the default options for render from RTL, as well
// as allows the user to specify other things such as initialState, store.
export interface ExtendedRenderOptions extends Omit<testReact.RenderOptions, "queries"> {
    // TODO: msal?: MsalReactTester;
}

export interface RenderResult extends ReturnType<typeof testReact.render> {
}

/**
 * Renders a React component with a different sort of options, such as predefined store state.
 * @param ui The React component to render.
 * @param extendedRenderOptions The options to be used when rendering the component, such as a store state.
 * @returns The rendered object.
 */
export async function renderWithProviders(
    ui: React.ReactElement,
    extendedRenderOptions: ExtendedRenderOptions = {}
): Promise<RenderResult> {
    const {
        // TODO: msal = extendedRenderOptions.msal ?? new MsalReactTester(),
        ...renderOptions
    } = extendedRenderOptions;

    const Wrapper = ({ children }: PropsWithChildren): JSX.Element => (
        <Provider store={fakeStore.store}>
            <Router location={fakeRouter.history.location} navigator={fakeRouter.history}>
                {children}
            </Router>
        </Provider>
    );

    const renderResult = testReact.render(ui, { wrapper: Wrapper, ...renderOptions });

    return renderResult;
}
