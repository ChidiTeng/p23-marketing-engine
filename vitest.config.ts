import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const rootDir = fileURLToPath(new URL("./", import.meta.url));

export default defineConfig({
    root: rootDir,
    test: {
        projects: [
            {
                root: rootDir,
                test: {
                    name: "root",
                    environment: "jsdom",
                    setupFiles: [path.join(rootDir, "tests/setup.ts")],
                    globals: true,
                    clearMocks: true,
                    restoreMocks: true,
                    mockReset: true,
                    include: [
                        "hooks/**/*.test.ts",
                        "hooks/**/*.test.tsx",
                        "lib/**/*.test.ts",
                        "lib/**/*.test.tsx",
                        "components/**/*.test.ts",
                        "components/**/*.test.tsx",
                        "mocks/**/*.test.ts",
                        "mocks/**/*.test.tsx",
                        "app/**/*.test.ts",
                        "app/**/*.test.tsx",
                    ],
                    exclude: ["backend/**", "node_modules/**"],
                },
                resolve: {
                    alias: {
                        "@": rootDir,
                    },
                },
            },
        ],
    },
});
