import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const ENV_PREFIX = "REACT_APP_";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, "env", ENV_PREFIX);

    return {
        base: env.VITE_BASE_URL || "/",
        css: {
            preprocessorOptions: {
                scss: {
                    api: "modern",
                    additionalData: `@use "@/styles/_variables" as *; @use "@/styles/_mixins" as *;`
                }
            }
        },
        plugins: [
            react()
        ],
        resolve: {
            tsconfigPaths: true,
            alias: {
                "@": path.resolve(__dirname, "./src")
            }
        },
        server: {
            port: 5096,
            open: env.SERVER_OPEN_BROWSER === "true"
        },
        build: {
            outDir: "build"
        }
    }
});
