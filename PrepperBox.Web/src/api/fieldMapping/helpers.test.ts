import { normalizeApiFieldName } from "./helpers";

describe("normalizeApiFieldName", () => {
    it("normalizeApiFieldName: returns a plain field name unchanged", () => {
        expect(normalizeApiFieldName("Name")).toBe("Name");
    });

    it("normalizeApiFieldName: takes the last segment of dot notation", () => {
        expect(normalizeApiFieldName("Product.Name")).toBe("Name");
    });

    it("normalizeApiFieldName: strips array indices", () => {
        expect(normalizeApiFieldName("Items[0]")).toBe("Items");
        expect(normalizeApiFieldName("Product.Items[2]")).toBe("Items");
    });

    it("normalizeApiFieldName: returns the original value for an empty string", () => {
        expect(normalizeApiFieldName("")).toBe("");
    });
});
