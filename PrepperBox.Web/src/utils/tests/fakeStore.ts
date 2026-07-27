import { createFakeStore } from "@hwndmaster/atom-testing-utils";
import { setupStore, setStore, applicationWatchers } from "@/store/setup";

export const fakeStore = createFakeStore({ setupStore, setStore, applicationWatchers });
