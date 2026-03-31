/* eslint-disable @typescript-eslint/naming-convention */

interface ImportMetaEnv {
  readonly SERVER_OPEN_BROWSER: "true" | "false";
  readonly MODE: Modes;
  readonly VITE_BASE_URL: string;
  readonly VITE_API_URL: string;
}

type Modes = "development" | "production" | "test";

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
