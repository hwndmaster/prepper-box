import globals from "globals";
import { importX } from "eslint-plugin-import-x";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import jsdocConfig from "eslint-plugin-jsdoc";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import testingLibrary from "eslint-plugin-testing-library";
import ts from "@typescript-eslint/eslint-plugin";
import stylistic from "@stylistic/eslint-plugin";
import vitest from "@vitest/eslint-plugin";

export default [
    {
        ignores: [
            "build/",
            "node_modules/",
            "coverage/",

            // Not caring about linting in config files:
            "eslint.config.js",
            "vite.config.ts",
            "vitest.config.ts",
            "setupTests.ts",

            // Not caring about linting NSwag-related files:
            "nswag/",
        ]
    },
    // TypeScript ESLint recommended flat configs (base + eslint-recommended + recommended)
    ...ts.configs["flat/recommended"],
    importX.flatConfigs.recommended,
    {
        ...importX.flatConfigs.typescript,
        settings: {
            ...importX.flatConfigs.typescript.settings,
            "import-x/resolver": undefined,
            "import-x/resolver-next": [
                createTypeScriptImportResolver({
                    alwaysTryTypes: true,
                }),
            ],
        },
    },
    {
        files: ["**/*.ts", "**/*.tsx"],
        plugins: {
            react,
            vitest,
            jsdoc: jsdocConfig,
            "testing-library": testingLibrary,
            "react-hooks": reactHooks,
            "@stylistic": stylistic,
        },
        linterOptions: {
            reportUnusedDisableDirectives: true,
        },
        languageOptions: {
            parserOptions: {
                project: "./tsconfig.eslint.json",
                tsconfigRootDir: import.meta.dirname,
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2025,
                ...vitest.environments.env.globals,
                "React": "readonly",
                "JSX": "readonly",
            }
        },
        settings: { react: { version: "detect" } },
        rules: {
            // Recommended rules
            ...vitest.configs.recommended.rules,

            // General rules
            "no-implied-eval": "off", // disabled in favor of `@typescript-eslint/no-implied-eval`
            "no-unused-expressions": "off", // disabled in favor of `@typescript-eslint/no-unused-expressions`
            "no-unused-vars": "off", // disabled in favor of `@typescript-eslint/no-unused-vars`
            "no-console": "warn",
            "no-var": "error",
            "@typescript-eslint/consistent-type-assertions": "error",
            "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
            "@typescript-eslint/consistent-type-exports": "error",
            "@typescript-eslint/explicit-function-return-type": "error",
            "@typescript-eslint/no-duplicate-enum-values": "error",
            "@typescript-eslint/no-empty-object-type": ["error", {
                allowInterfaces: "with-single-extends"
            }],
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/no-floating-promises": ["error", {
                ignoreVoid: true,
            }],
            "@typescript-eslint/no-implied-eval": "error",
            "@typescript-eslint/no-inferrable-types": "error",
            "@typescript-eslint/no-meaningless-void-operator": "error",
            "@typescript-eslint/no-misused-new": "error",
            "@typescript-eslint/no-misused-promises": "error",
            "@typescript-eslint/no-mixed-enums": "error",
            "@typescript-eslint/no-namespace": "error",
            "@typescript-eslint/no-non-null-asserted-nullish-coalescing": "error",
            "@typescript-eslint/no-non-null-asserted-optional-chain": "error",
            "@typescript-eslint/no-require-imports": "error",
            "@typescript-eslint/no-this-alias": "error",
            "@typescript-eslint/no-unnecessary-parameter-property-assignment": "error",
            "@typescript-eslint/no-unnecessary-template-expression": "error",
            "@typescript-eslint/no-unnecessary-type-constraint": "error",
            "@typescript-eslint/no-unsafe-argument": "warn", // TODO: Currently cannot mark as `error` due to usage of "fetch to `any`" in several files.
            "@typescript-eslint/no-unsafe-assignment": "off", // TODO: Currently cannot mark as `error` due to issues with redux-saga.
            "@typescript-eslint/no-unsafe-call": "off", // TODO: Currently cannot mark as `error` due to issues with redux-saga.
            "@typescript-eslint/no-unsafe-enum-comparison": "error",
            "@typescript-eslint/no-unsafe-member-access": "off", // TODO: Currently cannot mark as `error` due to issues with redux-saga.
            "@typescript-eslint/no-unused-vars": ["error", {
                "argsIgnorePattern": "^_",
                "varsIgnorePattern": "^_"
            }],
            "@typescript-eslint/no-unused-expressions": "error",
            "@typescript-eslint/no-wrapper-object-types": "error",
            "@typescript-eslint/only-throw-error": "error",
            "@typescript-eslint/prefer-as-const": "error",
            "@typescript-eslint/prefer-enum-initializers": "error",
            "@typescript-eslint/prefer-find": "error",
            "@typescript-eslint/prefer-for-of": "error",
            "@typescript-eslint/prefer-function-type": "error",
            "@typescript-eslint/prefer-includes": "error",
            "@typescript-eslint/prefer-literal-enum-member": ["error",
                {
                    allowBitwiseExpressions: true
                }
            ],
            "@typescript-eslint/prefer-nullish-coalescing": "error",
            "@typescript-eslint/prefer-optional-chain": "error",
            "@typescript-eslint/prefer-readonly": "warn",
            "@typescript-eslint/prefer-reduce-type-parameter": "error",
            "@typescript-eslint/promise-function-async": "error",
            "@typescript-eslint/require-array-sort-compare": "error",
            "@typescript-eslint/restrict-template-expressions": "error",
            "@typescript-eslint/strict-boolean-expressions": "error",
            "@typescript-eslint/use-unknown-in-catch-callback-variable": "error",

            // JSDoc rules
            "jsdoc/require-jsdoc": ["warn", { // Keep it `warn` for now, since we cannot put react components to ignore, for which we don't need JSDoc
                publicOnly: true
            }],
            "jsdoc/require-description": "error",
            "jsdoc/require-property-description": "error",
            "jsdoc/require-param-type": "off",
            "jsdoc/require-returns-type": "off",

            // React rules
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",

            // Import rules
            "import-x/no-deprecated": "warn",
            "import-x/no-empty-named-blocks": "warn",
            "import-x/no-extraneous-dependencies": "warn",
            "import-x/no-mutable-exports": "error",
            "import-x/no-rename-default": "error",
            "import-x/no-unused-modules": "error",
            "import-x/no-amd": "error",
            "import-x/no-commonjs": "error",
            "import-x/no-import-module-exports": "error",
            "import-x/no-absolute-path": "error",
            "import-x/no-cycle": "error",
            "import-x/no-useless-path-segments": "error",
            "import-x/exports-last": "error",
            "import-x/first": "error",
            "import-x/max-dependencies": ["warn", {
                max: 20,
                ignoreTypeImports: true,
            }],
            "import-x/newline-after-import": "error",
            "import-x/no-anonymous-default-export": "error",
            "import-x/order": ["error", {
                groups: [
                    "builtin",
                    "external",
                    "internal",
                    "parent",
                    "sibling",
                    "index",
                    "object"
                ],
            }],

            // Naming rules
            "@typescript-eslint/naming-convention": ["error",
                {
                    "selector": "default",
                    "format": ["camelCase"]
                },
                {
                    "selector": "variable",
                    "format": ["camelCase", "PascalCase"]
                },
                {
                    "selector": "variable",
                    "modifiers": ["global"],
                    "format": ["camelCase", "PascalCase"]
                },
                {
                    "selector": "objectLiteralProperty",
                    "format": null // to allow dashes in the names, such as `data-testid` or `area-label`
                },
                {
                    "selector": "parameter",
                    "format": ["camelCase"],
                    "leadingUnderscore": "allow"
                },
                {
                    "selector": "parameterProperty",
                    "format": ["camelCase"],
                    "leadingUnderscore": "allow"
                },
                {
                    "selector": "property",
                    "filter": {
                        regex: "^VITE_.+",
                        match: true
                    },
                    "format": ["UPPER_CASE"]
                },
                {
                    "selector": "typeLike",
                    "format": ["PascalCase"]
                },
                {
                    "selector": "enumMember",
                    "format": ["PascalCase"]
                },
                {
                    "selector": "typeParameter",
                    "format": ["PascalCase"],
                    "prefix": ["T"]
                },
                {
                    "selector": "import",
                    "format": null
                },
                {
                    "selector": "interface",
                    "format": ["PascalCase"],
                    "custom": {
                      "regex": "^I[A-Z]", // Don't allow I prefix for interfaces
                      "match": false
                    }
                },
                {
                    "selector": "variable",
                    "types": ["boolean"],
                    "format": ["PascalCase"],
                    "prefix": ["is", "Is", "should", "Should", "has", "Has", "can", "Can", "does", "Does", "did", "Did", "will", "Will"]
                },
                {
                    "selector": "property",
                    "modifiers": ["readonly"],
                    "format": ["camelCase"],
                    "leadingUnderscore": "requireDouble",
                    "filter": {
                        "regex": "^__brand$",
                        "match": true
                    }
                },

                // Temporary naming conventions:
                {
                    "selector": "variable",
                    "filter": {
                        regex: "^Demo_.+",
                        match: true
                    },
                    "format": null,
                }
            ],

            // Stylistic rules
            "indent": [
                "error",
                4,
                {
                    "SwitchCase": 1
                }
            ],
            "quotes": ["error", "double"],
            "@stylistic/brace-style": ["error", "1tbs", {
                "allowSingleLine": true
            }],
            "@stylistic/no-extra-semi": "error",
            "@stylistic/semi": ["error", "always"],
            "@stylistic/member-delimiter-style": "error",
            "@stylistic/operator-linebreak": ["error", "before"],

            // Testing environment rules
            "testing-library/await-async-events": "error",
            "testing-library/await-async-queries": "error",
            "testing-library/await-async-utils": "error",
            "testing-library/consistent-data-testid": [
                "error",
                {
                    // TODO: Cannot use `{fileName}` placeholder due to an error in the lib.
                    //       Ref: https://github.com/testing-library/eslint-plugin-testing-library/issues/782
                    //testIdPattern: "^{fileName}__([A-Z]+[a-z]+_?)+$", // Example: SideNav_ButtonGroup_Projects
                    testIdPattern: "^[A-Za-z]+__([A-Z]+[a-z]+_?)+$", // Example: SideNav_ButtonGroup_Projects
                    testIdAttribute: "data-testid"
                }
            ],

            // TODO: This rule is currently not supported with ESLint v9+. Uncomment after upgrading `eslint-plugin-testing-library`
            //"testing-library/no-debugging-utils": "error",
            "testing-library/no-dom-import": "error",

            "vitest/no-conditional-tests": "error",
        },
    },
    {
        files: ["**/__tests__/*", "**/serviceWorker.ts"],
        languageOptions: {
            parserOptions: {
                project: "./tsconfig.test.json",
                tsconfigRootDir: import.meta.dirname,
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2025,
                ...vitest.environments.env.globals,
                "React": "readonly",
                "JSX": "readonly",
            }
        },
        rules: {
            "no-console": "off",
        }
    },
    {
        files: ["**/store/**/sagas.ts"],
        rules: {
            "@typescript-eslint/promise-function-async": "off", // Saga generator functions yield promises without async/await
        }
    }
];
