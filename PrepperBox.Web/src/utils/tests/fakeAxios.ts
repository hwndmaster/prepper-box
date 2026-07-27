import { FakeAxios } from "@hwndmaster/atom-testing-utils";
import { setApiAxiosInstance } from "@/api/apiAxios";

export { FakeAxios };
export const fakeAxios = new FakeAxios(setApiAxiosInstance);
export default fakeAxios;
