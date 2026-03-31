import { act } from "react";
import { screen } from "@testing-library/react";
import * as commonActions from "@/store/common/actions";
import LoadingTargets from "@/shared/loadingTargets";
import { LoadingSpinner } from "@/components/loadingSpinner";
import { renderWithProviders } from "../utils/renderWithProviders";
import fakeStore from "../utils/fakeStore";

beforeEach(() => {
    fakeStore.setup();
});

afterEach(() => {
    fakeStore.reset();
});

test("When target is not active, loading spinner is not active", async () => {
    // Arrange
    const target = LoadingTargets.ActiveView;
    const children = <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit.</p>;

    // Act
    await renderWithProviders(<LoadingSpinner target={target}>{children}</LoadingSpinner>);

    // Verify
    const loadingSpinner = screen.getByTestId(`LoadingSpinner__${target}`);
    expect(loadingSpinner).toBeInTheDocument();
    expect(loadingSpinner).toHaveAttribute("data-loading", "false");
});

test("When target is active, loading spinner is active", async () => {
    // Arrange
    const target = LoadingTargets.ActiveView;
    const children = <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit.</p>;
    await renderWithProviders(<LoadingSpinner target={target}>{children}</LoadingSpinner>);

    // Act
    act(() => {
        fakeStore.store.dispatch(commonActions.showLoader(target));
    });

    // Verify
    const loadingSpinner = screen.getByTestId(`LoadingSpinner__${target}`);
    expect(loadingSpinner).toBeInTheDocument();
    expect(loadingSpinner).toHaveAttribute("data-loading", "true");
});

test("When another target is activating, loading spinner stays inactive", async () => {
    // Arrange
    const target1 = LoadingTargets.ActiveView;
    const target2 = LoadingTargets.Categories;
    const children = <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit.</p>;
    await renderWithProviders(<LoadingSpinner target={target1}>{children}</LoadingSpinner>);

    // Act
    act(() => {
        fakeStore.store.dispatch(commonActions.showLoader(target2));
    });

    // Verify
    const loadingSpinner = screen.getByTestId(`LoadingSpinner__${target1}`);
    expect(loadingSpinner).toBeInTheDocument();
    expect(loadingSpinner).toHaveAttribute("data-loading", "false");
});
