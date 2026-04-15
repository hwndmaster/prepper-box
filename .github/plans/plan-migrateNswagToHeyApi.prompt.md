# Plan: Migrate from NSwag to @hey-api/openapi-ts

**TL;DR:** Replace NSwag with `@hey-api/openapi-ts` + `@hey-api/client-axios`. It solves all your current pain points (DateTimeOffset typing, naming, ref types, template maintenance) while providing first-class Axios support, a plugin system, and built-in auth — all running in Node.js without .NET.

## Library Comparison

| Library | Verdict | Key issue for your project |
|---------|---------|------------|
| **NSwag** | Replace | Liquid templates fragile, DateTimeOffset→`any` unfixable, .NET runtime dependency |
| **@hey-api/openapi-ts** | **Recommended** | First-class Axios plugin, resolvers for type customization, class-based SDK, plugin system |
| **Orval** | Strong runner-up | Axios is via mutator workaround (not a dedicated plugin), functional factory style differs from your current class-based pattern, less fine-grained type control |
| **openapi-ts** (openapi-typescript) | Not suitable | Types-only — no client generation. Uses path-based fetch pattern, massive paradigm shift |
| **Kubb / Kiota / OpenAPI Generator** | Not recommended | Less mature (Kubb), enterprise/Java-heavy (Kiota, OAG), poor TS customization |

### Why @hey-api/openapi-ts wins for your case:
- **`@hey-api/client-axios` plugin** — dedicated Axios client with `setConfig()`, interceptors, `auth()` callback, custom instance support
- **Resolvers API** — customize type output per schema format (solves DateTimeOffset → `number`)
- **Class-based SDK** — `operations.strategy: 'single'` generates class-style clients matching your current `CategoriesClient`, `ProductsClient`, etc.
- **`buildUrl()`** — type-safe URL construction that can replace `operations` for test mocking
- **Clean separation** — `types.gen.ts` + `sdk.gen.ts` + `client.gen.ts` (no 1800-line monolith)
- **No .NET dependency** — pure Node.js, runs via npm script
- **Used by Vercel, PayPal** in production (despite 0.x version)

---

## Steps

### Phase 1 — Setup & Configuration *(no dependencies)*

1. Install packages: `@hey-api/openapi-ts`, `@hey-api/client-axios`, `@hey-api/typescript`, `@hey-api/sdk`
2. Create `PrepperBox.Web/openapi-ts.config.ts` — input from `http://localhost:5095/openapi/v1.json`, output to `src/api/generated`, configure Axios client plugin with `runtimeConfigPath`, SDK with class strategy
3. Add `"generate-api": "openapi-ts"` script to `PrepperBox.Web/package.json`

### Phase 2 — Type Customization *(depends on 1)*

4. Run generation and inspect output — check DateTimeOffset fields, ref type representation, method naming
5. Handle reference types — likely keep current `entityId.ts` exclusion pattern (simplest), or use a TypeScript resolver to map known schema formats to branded types
6. Handle DateTimeOffset — if OpenAPI spec correctly outputs `number`/`integer`, it works automatically. If it outputs `string/date-time`, use a resolver or fix the .NET OpenAPI config in `PrepperBox.WebApi/`

### Phase 3 — Client Infrastructure *(depends on 2)*

7. Create `src/api/heyApiConfig.ts` — `createClientConfig()` replicating current Axios factory behavior (timeout, interceptors, auth injection)
8. Adapt `src/api/apiAxios.ts` — replace NSwag client instantiation with Hey API SDK, keep `setApiAxiosInstance()` for test injection
9. Adapt `src/store/apiRequest.ts` — update `callApi()` wrapper to work with Hey API's response format (Hey API returns data directly, not wrapped in `ApiResponse<T>`)

### Phase 4 — Test Mocking *(depends on 3)*

10. Evaluate replacement for `operations`/`operationParams` — Hey API's `buildUrl()` provides type-safe URL construction; generated `*Data` request types provide parameter types. Write a thin adapter in `fakeAxios.ts` to preserve the current `setupGet(client, operation, params)` test API, or refactor tests to use Hey API patterns directly
11. Run all existing tests, fix any mock setup that changed

### Phase 5 — Consumer Code Migration *(depends on 3 & 4)*

12. Update all imports across converters (`src/api/converters/`), sagas (`src/store/`), and components — change from `@/api/api.generated` to new generated path
13. If SDK method names changed, update all callsites

### Phase 6 — Cleanup *(all tests must pass first)*

14. Delete `nswag/` directory, `api.generated.ts`, and unused infrastructure (`ApiClientBase`, `ApiResponse` if replaced)
15. Remove NSwag npm script and dependency; update `.gitignore`

---

## Relevant files

### To create:
- `PrepperBox.Web/openapi-ts.config.ts` — Hey API configuration
- `PrepperBox.Web/src/api/heyApiConfig.ts` — Runtime client configuration
- Possibly a custom plugin for `operations`/`operationParams` if needed

### To modify:
- `PrepperBox.Web/package.json` — Dependencies and scripts
- `PrepperBox.Web/src/api/apiAxios.ts` — Client singleton facade
- `PrepperBox.Web/src/api/setup.ts` — Initialization
- `PrepperBox.Web/src/store/apiRequest.ts` — `callApi()` wrapper and `ApiRequest` class
- `PrepperBox.Web/src/__tests__/utils/fakeAxios.ts` — Test mocking infrastructure
- `PrepperBox.Web/src/api/converters/*.ts` — DTO→model converter imports
- All files importing from `@/api/api.generated`

### To delete (Phase 6):
- `PrepperBox.Web/nswag/` — Entire directory
- `PrepperBox.Web/src/api/api.generated.ts`
- `PrepperBox.Web/src/api/apiClientBase.ts` (if no longer needed)
- `PrepperBox.Web/src/api/apiResponse.ts` (if replaced)

### To keep unchanged:
- `PrepperBox.Web/src/shared/entityId.ts` — Branded types (keep as-is)
- `PrepperBox.Web/src/models/types.ts` — Re-exports (keep as-is)

---

## Verification

1. `npx tsc --noEmit` — generated types compile cleanly
2. `npm run build` — zero build errors
3. Run full test suite — all existing tests pass
4. Manual smoke test — all CRUD operations work end-to-end
5. Inspect `types.gen.ts` — DateTimeOffset fields are `number`, not `any`
6. Inspect SDK — ref parameters use branded `EntityId<T>` types
7. Auth injection works via interceptors on generated client

---

## Decisions

- **Incremental migration**: Keep old generated code alongside new during migration; delete only after all tests pass
- **Ref types**: Keep current `entityId.ts` branded type approach; exclude from generation (simplest)
- **SDK style**: Start with class mode for easier migration; consider flat (tree-shakeable) mode later
- **`callApi()` wrapper**: Preserve the Redux Saga integration layer; adapt internals for Hey API response format

## Further Considerations

1. **DateTimeOffset root cause** — Before migrating, check what `http://localhost:5095/openapi/v1.json` actually outputs for DateTimeOffset properties. If the .NET `JsonConverter` serializes them as epoch numbers, the schema should say `type: integer`. If the schema is wrong, fix the WebAPI OpenAPI config first. *Recommendation: inspect the spec.*
2. **SDK style** — Class mode (`single` strategy) preserves your pattern but doesn't tree-shake. Flat mode is the Hey API default and recommended. *Recommendation: start with class, consider flat later.*
3. **`operations`/`operationParams` for testing** — The most effort-intensive part of the migration. If `buildUrl()` + generated request types don't fully replace the current test API, a custom Hey API plugin can generate equivalent static objects. *Recommendation: evaluate `buildUrl()` first.*
