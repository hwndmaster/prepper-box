# Plan: Atom Web Shared Packages Monorepo

Create a new **atom-web** GitHub repository as a pnpm monorepo containing 10 npm packages that extract shared TypeScript, React, Redux, ESLint, and NSwag code from prepper-box and buddy-kenteken. Packages are published to GitHub Packages under the `@hwndmaster` scope.

## Context & Findings

- **15 files are 100% identical** between the two projects
- **16 more are nearly identical** (only import paths or domain names differ)
- **ESLint configs are identical** (300+ lines)
- Estimated **~70-75%** of Web infrastructure code is duplicated
- The Atom .NET framework is a pure .NET monorepo — confirmed: separate repo for TypeScript

### Why pnpm Workspaces

pnpm is a **stable, mature** npm-compatible package manager (since 2016), used by Vite itself, Vue, and Nuxt. The key benefit for *this specific project*:

**Strict dependency isolation** — If `atom-react-forms` accidentally uses `axios` without declaring it, pnpm catches this at dev time. npm workspaces would silently hoist it, and the package would break when consumed externally. For shared packages, this is the difference between "works on my machine" and "works everywhere."

The CLI is nearly identical to npm (`pnpm install`, `pnpm test`, `pnpm publish`). Migration cost is minimal.

---

## Package Architecture (10 packages)

### Tier 1 — No React Dependency

| # | Package | Key Exports |
|---|---------|-------------|
| 1 | `@hwndmaster/atom-web-core` | `Logger`, `ErrorInfo`, `EntityId<T>`, `getEnumOptions()`, `mapDictionary()`, `ticksToDate()`, `dateToTicks()`, environment flags, base `LoadingTargets` (`WholePage`, `ActiveView`) |
| 2 | `@hwndmaster/atom-api-core` | `AxiosInstanceFactory`, `ApiClientBase`, `ApiResponse`, `callApi()` fluent builder, `ApiTimeoutMs` |
| 3 | `@hwndmaster/atom-api-nswag` | 5 Liquid templates (`AxiosClient`, `Client.ProcessResponse`, `Client.ProcessResponse.HandleStatusCode`, `Client.RequestUrl`, `ParameterType`), `apiClientBase.ts`; consumed directly from `node_modules` via NSwag `templateDirectory` setting |
| 4 | `@hwndmaster/atom-eslint-common` | Flat config: `@typescript-eslint/**`, `jsdoc/**`, `import-x/**`, base `no-*` rules |
| 5 | `@hwndmaster/atom-eslint-stylistic` | Flat config: `@stylistic/**`, indent, quotes, `naming-convention` |

### Tier 2 — React (no PrimeReact)

| # | Package | Key Exports |
|---|---------|-------------|
| 6 | `@hwndmaster/atom-react-core` | `CircularProgress`, `LoadingSpinner`, `requiredRef()`, `optionalRef()`, route utilities (`getRouteWithParameters`, `goTo`, `getCurrentRoute`, `RouteDefinition`), component SCSS modules (`circularProgress.module.scss`, `loadingSpinner.module.scss`) |
| 7 | `@hwndmaster/atom-eslint-react` | Flat config: react, react-hooks, testing-library, vitest rules |

### Tier 3 — React + PrimeReact

| # | Package | Key Exports |
|---|---------|-------------|
| 8 | `@hwndmaster/atom-react-prime` | `ToastService`, `ToastProvider`, `useToast()`, `FormInputText`, `FormInputNumber`, `FormDropdown`, `FormAutoComplete`, `FormChips`, `FormInputTextarea`, component SCSS (`forms.module.scss`, `styles/forms.scss`) |

### Tier 4 — Redux + Saga Dependency

| # | Package | Key Exports |
|---|---------|-------------|
| 9 | `@hwndmaster/atom-react-redux` | `createAppStore()` factory, `createActionWithMeta()`, `withLoading()`, `withCallback()`, `errorFallback()`, common state slice |
| 10 | `@hwndmaster/atom-testing-utils` | `renderWithProviders()`, `sagaRunner()`, `fakeStore()`, `fakeRouter()`, `fakeAxios()`, `fakeToast()` |

> Note: `atom-eslint-*` packages have no runtime dependency on any framework — they only configure linting rules.

### Dependency Graph

```
atom-web-core (standalone — no React, no PrimeReact, no react-router-dom)
atom-api-core → atom-web-core
atom-api-nswag (standalone — ships Liquid templates + NSwag config scaffolding)

atom-react-core → atom-web-core (peer deps: react, react-hook-form, zod, react-router-dom, react-redux)
atom-react-prime → atom-web-core + atom-react-core (peer deps: primereact)
atom-react-redux → atom-web-core + atom-api-core (peer deps: @reduxjs/toolkit, react-redux, redux-saga, redux-persist)
atom-testing-utils → atom-react-redux + atom-react-core

atom-eslint-common (standalone)
atom-eslint-common ← atom-eslint-stylistic
atom-eslint-common ← atom-eslint-react
```

---

## Implementation Steps

### Phase 1: Repository Scaffolding *(no dependencies)*

1. Create `atom-web` repo, initialize pnpm monorepo (`pnpm-workspace.yaml`, root `package.json`, root `tsconfig.base.json`)
2. Configure `.npmrc` for GitHub Packages auth
3. Set up **tsup** (esbuild-based) as the build tool — fast, handles ESM + CJS dual output
4. Configure `package.json` `exports` field for each package

### Phase 2: Core Packages *(depends on Phase 1)*

**Step 2.1 — `atom-web-core`**
- Extract identical shared files: logger, errorInfo, entityId, constants, helpers (`getEnumOptions`, `mapDictionary`, `ticksToDate`, `dateToTicks`, `inputDateToTicks`), base `LoadingTargets` enum (`WholePage = 0`, `ActiveView = 1` only — projects extend with domain-specific values)
- Project-specific helpers stay in their projects (e.g., `convertKwToHp` in buddy-kenteken)
- **No dependencies on React, PrimeReact, or react-router-dom** — route utilities move to `atom-react-core`

**Step 2.2 — `atom-api-core`**
- Extract: `AxiosInstanceFactory`, `ApiClientBase`, `ApiResponse`, `callApi()` fluent builder, `ApiTimeoutMs` constant
- `setupAxiosInstances()`, `setApiAxiosInstance`/`getApiAxiosInstance`, and `apiAxios.ts` stay in each project — they wire up project-specific API client instances from NSwag-generated code
- Peer dependencies: `axios`, `redux-saga`
- Depends on `atom-web-core` (for Logger, ErrorInfo)

**Step 2.3 — `atom-api-nswag`**
- Extract all 5 customized Liquid templates (100% identical between projects):
  - `AxiosClient.liquid` — custom client class with `operations`/`operationParams` static properties, improved method naming, reference type support
  - `Client.ProcessResponse.liquid` — added 404 debugging support
  - `Client.ProcessResponse.HandleStatusCode.liquid` — added `typeof` object check to avoid `JSON.parse` on objects
  - `Client.RequestUrl.liquid` — improved array query parameter serialization, case-insensitive path parameter replacements
  - `ParameterType.liquid` — reference type support via `AdditionalPropertiesSchema`
- Include `apiClientBase.ts` (identical between projects)
- **Distribution strategy (verified)**: NSwag resolves `templateDirectory` via simple `Path.Combine(directory, template + ".liquid")` + `File.Exists()`, relative to the .NET process CWD. Since the npm script runs `cd ./nswag && nswag run`, the CWD is the project's `nswag/` folder. Setting `templateDirectory` to `"../node_modules/@hwndmaster/atom-api-nswag/templates"` correctly resolves to `<Project>.Web/node_modules/@hwndmaster/atom-api-nswag/templates/`. No copy step needed.
- **`webapi.nswag` stays in each project** — it contains project-specific values (`url`, `excludedTypeNames`, `output` path, `extensionCode` path). Only the `templateDirectory` line changes:
  ```json
  "templateDirectory": "../node_modules/@hwndmaster/atom-api-nswag/templates"
  ```
- **`api-extensions-ts.template` stays in each project** — it contains project-specific import paths for reference types. The `extensionCode` setting (`"./api-extensions-ts.template"`) is resolved separately from templates.
- **No runtime dependencies** — this is a development-time tooling package

### Phase 3: React Packages *(depends on Phase 2)*

**Step 3.1 — `atom-react-core`** *(no PrimeReact dependency)*
- Extract UI components with their coupled SCSS modules:
  - `CircularProgress` + `circularProgress.module.scss` (depends on `react` only)
  - `LoadingSpinner` + `loadingSpinner.module.scss` (depends on `react`, `react-redux` — reads Redux state for loading targets; keep current API)
- Extract validation helpers:
  - `requiredRef()`, `optionalRef()` (depends on `zod`, uses `EntityId` from `atom-web-core`)
- Extract route utilities (depends on `react-router-dom`):
  - `getRouteWithParameters()`, `goTo()`, `getCurrentRoute()`, `RouteDefinition` type
  - NOT app-specific route constants — those stay in each project
- **SCSS strategy**: Component-coupled SCSS modules (identical between projects) are shipped with the package. Project-specific styles (`datatable.scss`, `main.scss`, `pageContent.scss`, etc.) remain in consuming projects.
- Peer dependencies: `react`, `react-redux`, `@reduxjs/toolkit`, `react-hook-form`, `zod`, `react-router-dom`
- Depends on `atom-web-core` (for `EntityId`, base `LoadingTargets`, Logger)

**Step 3.2 — `atom-react-prime`** *(PrimeReact-dependent code)*
- Extract toast functionality:
  - `ToastService` (uses PrimeReact `Toast` types — compile-time only, no runtime React dependency in the service itself)
  - `ToastProvider` + `useToast()` hook (React context wrapping PrimeReact `Toast` component)
- Extract form components with their coupled SCSS:
  - `FormInputText`, `FormInputNumber`, `FormDropdown`, `FormAutoComplete`, `FormChips`, `FormInputTextarea`
  - `forms.module.scss` + `styles/forms.scss` (both identical between projects)
- All form components use `react-hook-form` `Controller` + PrimeReact components + `FloatLabel`
- **SCSS strategy**: Ship `forms.module.scss` and the shared `forms.scss` it imports. The `forms.module.scss` path `@use "../../styles/forms.scss"` needs to be updated to a package-internal relative import.
- Peer dependencies: `react`, `react-hook-form`, `primereact`
- Depends on `atom-web-core` (for Logger, ErrorInfo), `atom-react-core` (for validation helpers if needed)
- Shared packages import PrimeReact directly internally; each consuming project maintains its own barrel re-export

### Phase 4: Redux Package *(depends on Phase 2)*

**Step 4.1 — `atom-react-redux`**
- Refactor `store/setup.ts` into a `createAppStore()` factory accepting domain reducers + saga watchers as parameters
- Extract: `createActionWithMeta()`, saga types, `withLoading()`, `withCallback()`, `typedSelect()`, `errorFallback()`, common state slice (state, actions, reducers, sagas — all identical between projects)
- Peer dependencies: `@reduxjs/toolkit`, `react-redux`, `redux-saga`, `redux-persist`
- Key design: `createAppStore()` accepts domain reducers map, persist config overrides, domain saga watchers array

**Step 4.2 — `atom-testing-utils`**
- Extract from prepper-box `__tests__/utils/`: `sagaRunner`, `renderWithProviders`, `fakeStore`, `fakeRouter`, `fakeLogger`, `fakeAxios`, `fakeToast`
- Peer dependencies: `vitest`, `@testing-library/react`, `react-redux`, `react-router-dom`
- Depends on `atom-react-redux`, `atom-react-core`

### Phase 5: ESLint Configs *(parallel with Phases 2–4)*

**Step 5.1 — `atom-eslint-common`** *(flat config approach — current best practice)*
- Export flat config array with: `@typescript-eslint/**` rules (all non-naming-convention), `jsdoc/**`, `import-x/**`, base `no-*` rules
- Include plugin dependencies as regular dependencies (not peer deps) — flat config best practice for shareable configs

**Step 5.2 — `atom-eslint-stylistic`**
- Export flat config array with: `@stylistic/**` rules, `indent` (4 spaces, SwitchCase: 1), `quotes` (double), `@typescript-eslint/naming-convention` (full complex config)
- Peer dep on `atom-eslint-common`

**Step 5.3 — `atom-eslint-react`**
- Export flat config array with: react, react-hooks, testing-library, vitest rules
- Separate test file overrides config

**Consumer ESLint config becomes:**
```js
import { commonConfig } from "@hwndmaster/atom-eslint-common";
import { stylisticConfig } from "@hwndmaster/atom-eslint-stylistic";
import { reactConfig, reactTestConfig } from "@hwndmaster/atom-eslint-react";

export default [
    { ignores: ["build/", "node_modules/", ...] },
    ...commonConfig,
    ...stylisticConfig,
    ...reactConfig,
    ...reactTestConfig,
    // Project-specific overrides only
];
```

### Phase 6: Migrate Consuming Projects *(depends on all packages published)*

**Step 6.1 — Migrate prepper-box**
1. Add `.npmrc` with GitHub Packages registry config
2. Install all `@hwndmaster/` packages
3. Replace local files with imports from packages
4. Refactor `store/setup.ts` to use `createAppStore()` factory, passing domain reducers
5. Refactor `store/setupSagas.ts` to use `createSagaWatchers()`, passing domain watchers
6. Replace form components + ESLint config with package equivalents
7. Extend base `LoadingTargets` with project-specific domain values
8. Update NSwag config: set `templateDirectory` to `node_modules/@hwndmaster/atom-api-nswag/templates/`; delete local copies of the 5 Liquid templates; keep project-specific `api-extensions-ts.template`, `apiAxios.ts`, and `webapi.nswag` (with updated `templateDirectory` path)
9. Run full test suite + lint to verify
10. Delete replaced local files

**Step 6.2 — Migrate buddy-kenteken** *(parallel with 6.1)*
- Same steps as prepper-box
- Additionally: port test utilities from package (buddy-kenteken currently lacks them)
- Standardize PrimeReact imports to use barrel re-export pattern

### Phase 7: CI/CD *(start in Phase 1, iterate)*

1. PR workflow: build all packages + run tests
2. Master push workflow: build + publish to GitHub Packages
3. Use **changesets** (`@changesets/cli`) for independent version management + changelog generation

---

## Verification

1. Each package has its own Vitest test suite
2. After publishing, install in both projects → run full test suites
3. `npm run lint` in both projects produces identical results to before migration
4. `npm run build` (Vite) succeeds with new imports
5. Manual smoke test: run both apps, verify forms, toasts, loading spinners, error handling

---

## Resolved Decisions

| # | Decision | Resolution |
|---|----------|------------|
| D1 | npm Package Scope | `@hwndmaster` (personal GitHub account) |
| D2 | Toast + React coupling | **Option B**: Toast moves to `atom-react-prime` — keeps `atom-web-core` and `atom-react-core` free of PrimeReact deps |
| D3 | LoadingSpinner Redux coupling | **Option A**: Keep current API, `react-redux` as peer dep in `atom-react-core` |
| D4 | PrimeReact barrel | **Option A**: Each project maintains its own barrel; shared packages import PrimeReact directly |
| D5 | `LoadingTargets` enum | **Option A**: `atom-web-core` exports base values (`WholePage = 0`, `ActiveView = 1`) + a number type; projects extend with domain-specific values |
| D6 | Environment constants | **Option A**: Keep in `atom-web-core`, assuming all projects use Vite with same env var names |

---

## Further Considerations

1. **SCSS from `node_modules`**: `atom-react-core` and `atom-react-prime` ship SCSS modules alongside their components. Vite handles `.scss` imports from `node_modules` natively, but may need `optimizeDeps.include` for the packages if pre-bundling issues arise. The `loadingSpinner.module.scss` references a `$color-bg-overlay` variable — this must either be defined within the package or injected via Vite's `css.preprocessorOptions.scss.additionalData` in the consuming project. **Needs verification during Phase 3.**

2. **`atom-api-nswag` template updates**: When Liquid templates are updated in atom-web, consuming projects get the new templates automatically on `npm install` / `pnpm install`. The consuming project must re-run `nswag run` manually to regenerate the API client. The `webapi.nswag` file stays in each project's `nswag/` folder — only the `templateDirectory` setting points to `node_modules`.

---

## Resolved Questions

| # | Question | Resolution |
|---|----------|------------|
| Q1 | `atom-react-core` peer dep weight | Acceptable — all consuming projects use the full stack (react, react-redux, react-hook-form, zod, react-router-dom). No need to split further. |
| Q2 | `atom-api-nswag` distribution | Use directly from `node_modules` — point NSwag's `templateDirectory` to `node_modules/@hwndmaster/atom-api-nswag/templates/`. No copy CLI needed. |
| Q3 | Versioning strategy | **Independent versions** per package using **changesets** (`@changesets/cli`). Changesets tracks which packages changed in each PR; CI only publishes new versions for packages that were actually modified. ESLint config packages will version slowly; React packages more frequently. |
