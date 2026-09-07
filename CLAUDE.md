# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

**PrepperBox** — emergency stock management: what you have, where it is stored, and when it expires.
A .NET solution on the **Genius.Atom** framework plus a React SPA on the `@hwndmaster/atom-*`
packages. Repository: <https://github.com/hwndmaster/prepper-box>.

Root namespace prefix is `Genius.PrepperBox.*`. Compose service prefix is **`prepper-box`** — here it
matches the repo directory name, unlike the sibling apps.

## Stack conventions live in plugins

The conventions for this stack are **not** in this repo. They come from the
[`geni-ai-sdlc-marketplace`](https://github.com/hwndmaster/geni-ai-sdlc-marketplace) plugins:

| Plugin | Covers |
|--------|--------|
| `atom-backend` | .NET test conventions — xUnit v3, AutoFixture + FakeItEasy, Atom `TestingUtil`, repository and schema tests, integration tests, the Atom build coupling |
| `atom-frontend` | SPA conventions — store slice layout, sagas, PrimeReact, Vitest, ESLint import boundaries |
| `atom-devops` | `publish-docker.ps1`, `packages-cleanup.ps1`, `ci.yml`, `nuget.config`, `CodeCoverage.runsettings` and friends — edit the plugin template, never the copy here |

This file carries only what is specific to *this* app.

## Solution map

`PrepperBox.slnx`

| Project | Scope |
|---------|-------|
| `PrepperBox.AppHost` | Aspire host — dashboard and orchestration |
| `PrepperBox.Core` | Domain logic |
| `PrepperBox.Db` | EF Core context, entities, migrations, repositories |
| `PrepperBox.Dto` | DTOs, references and request messages |
| `PrepperBox.WebApi` | ASP.NET Core API |
| `PrepperBox.Web` | React SPA |
| `PrepperBox.Db.Tests` | Repository tests plus the migrate-on-startup / schema tests |
| `PrepperBox.WebApi.Tests` | Request validators and the expiration-check background worker |
| `PrepperBox.WebApi.IntegrationTests` | End-to-end HTTP tests |

Entity ids are **`int`** — `models/types.ts` uses `EntityIntId` with `createIntRefConverter`
(`categoryRef(1)` and friends). Use the factories in tests instead of bare numbers.

## Ports

| What | Port |
|------|------|
| WebApi (local) | 5095 |
| Web dev server | 5096 |
| Web HTTPS (container) | 5097 → 8443, certs mounted from `./certs` |
| Aspire dashboard (container) | 15191 |
| OTLP gRPC / HTTP ingest | 21192 / 21193 |

`VITE_API_URL` in `.env` points the SPA at the API in development; production relies on the nginx
same-origin `/api/` proxy instead.

Docker also injects `Telegram__BotToken` and `Telegram__ChatId` from `TELEGRAM_BOT_TOKEN` /
`TELEGRAM_CHAT_ID` — this is the only app in the set with outbound notifications.

## Backend specifics

- **Repository tests** derive from Atom's `BaseRepositoryTests` — see
  `Repositories/CategoriesRepositoryTests.cs`. There is **no local `RepositoryTestContext` here**;
  the base class covers everything.
- **`PrepperBoxDbMigrationTests`** covers the migrate-on-startup strategy
  (`IDatabaseMigrator.MigrateWithBackupAsync`) against real SQLite files in a temp subdirectory.
  `InitialCreateMigration_ProducesSameSchemaAsEnsureCreated` is the schema-drift guard: if it fails
  after a model change, scaffold a new migration — the production database is baselined and must never
  re-run `InitialCreate`.
- **Integration test infrastructure** (`PrepperBox.WebApi.IntegrationTests/Infrastructure/`):
  - `PrepperBoxWebApiFactory` — runs the real `Program.cs` (migrations and mandatory-data seeding
    included) against a per-factory SQLite `:memory:` connection. Under the `IntegrationTests`
    environment `PrepperBoxSampleDataInitializer` seeds no sample stock, backups are disabled, and
    the `ExpirationCheckWorker` is parked outside its startup window so it never fires mid-test;
  - `ApiScenarioClient` — typed helpers for every CRUD controller, plus `GetJsonAsync` / `GetAsync` /
    `DeleteAsync` / `GetByIdsAsync`, raw `PostJsonAsync` / `PutJsonAsync` for negative cases, the
    route constants, and the JSON extractors `Id` / `Name` / `LastModified` / `Ticks`;
  - `FakeOpenFoodFactsHttpMessageHandler` — stubs the external **OpenFoodFacts** service (per-path
    JSON responses, a configurable fallback status, and the recorded outgoing requests), swapped in as
    the primary handler of the typed client registered under `IOpenFoodFactsClient`;
  - `HttpClientJsonExtensions`.
- **Timestamps**: use `ApiScenarioClient.Ticks(...)` to build expected values — the database stores
  Unix seconds, so sub-second precision does not round-trip.
- Scenario coverage: `MandatoryDataIntegrationTests` (startup seeding),
  `WorkflowScenarioIntegrationTests` (full stock lifecycle, aggregated counters, cascaded deletes,
  a family moved between categories), `RequestValidationIntegrationTests`,
  `VersionConflictIntegrationTests`, `OpenFoodFactsIntegrationTests`,
  `DatabaseIsolationIntegrationTests`.
- `ExpirationCheckWorkerTests` drives async code with a **signalling logger** rather than sleeping —
  follow that pattern for other background workers.

## Frontend specifics

`PrepperBox.Web`, dev server on 5096. `pnpm nswag` reads `http://localhost:5095/openapi/v1.json`, so
the API must be running.

- **Store slices**: `categories`, `consumptionLogs`, `openFoodFacts`, `productFamilies`, `products`,
  `storageLocations`, `trackedProducts`.
- `persistVersion: 3`, `persistBlacklist: ["common"]`.
- PrimeReact theme is `viva-dark`.
- `fakeAxios` and `fakeStore` live at `@/utils/tests/` — not under `store/testUtils/` as in the
  sibling apps. Saga tests may import from `api/`; the ESLint `no-restricted-paths` zone exempts
  `sagas.test` and the shared fakes.
- Barcode scanning uses `react-zxing`; charts use `recharts`.
- Forms: `productForm`, `trackedProductForm`, `editCategory`, `editStorageLocation`,
  `editProductFamily`. Schemas are `schemas/<entity>Schema.ts` exporting `<Entity>SchemaData`.
