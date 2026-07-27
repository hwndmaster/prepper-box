import { BaseLoadingTargets } from "@hwndmaster/atom-web-core";
import LoadingTargets from "@/shared/loadingTargets";

describe("LoadingTargets", () => {
    test("uses base loading target values", () => {
        expect(LoadingTargets.WholePage).toBe(BaseLoadingTargets.WholePage);
        expect(LoadingTargets.ActiveView).toBe(BaseLoadingTargets.ActiveView);
    });

    test("has unique numeric values", () => {
        const values = Object.values(LoadingTargets).filter((value): value is number => typeof value === "number");
        const uniqueValues = new Set(values);

        expect(uniqueValues.size).toBe(values.length);
    });
});
