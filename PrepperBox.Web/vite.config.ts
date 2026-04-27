import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

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
            react(),
            tsconfigPaths({
                projects: ["./tsconfig.app.json"]
            })
        ],
        resolve: {
            preserveSymlinks: true,
            dedupe: ["react", "react-dom", "react-redux"],
            alias: {
                "@": path.resolve(__dirname, "./src"),
                react: path.resolve(__dirname, "./node_modules/react"),
                "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
                "react-redux": path.resolve(__dirname, "./node_modules/react-redux")
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
