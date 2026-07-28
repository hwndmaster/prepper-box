---
name: dotnet-tests
description: Conventions and commands for the .NET test suite of the PrepperBox solution — unit, repository, and integration tests (xUnit v3, AutoFixture + FakeItEasy, Genius.Atom TestingUtil, EF Core SQLite, WebApplicationFactory). Use whenever writing, editing, running, or debugging tests in PrepperBox.Db.Tests, PrepperBox.WebApi.Tests, or PrepperBox.WebApi.IntegrationTests, or when measuring .NET code coverage.
---

# PrepperBox .NET tests

The solution (`PrepperBox.slnx`) has three test projects. Root namespace prefix is `Genius.PrepperBox.*`. Central package versions live in `Directory.Packages.props`; shared build/test wiring comes from the Atom framework's `Genius.Atom.Build.props` (imported via `Directory.Build.props`).

## Test projects

| Project | Scope |
|---------|-------|
| `PrepperBox.Db.Tests` | Repository tests (Atom's `BaseRepositoryTests`) plus the migrate-on-startup/schema tests. |
| `PrepperBox.WebApi.Tests` | Unit tests for WebApi-level logic: request validators and the expiration-check background worker. |
| `PrepperBox.WebApi.IntegrationTests` | End-to-end HTTP tests via `WebApplicationFactory` over SQLite, with a faked OpenFoodFacts backend. |

## Commands

| Task | Command (cwd = repo root) |
|------|---------------------------|
| Run all tests | `dotnet test PrepperBox.slnx` |
| Run one project | `dotnet test PrepperBox.Db.Tests` |
| Filter by name | `dotnet test --filter "FullyQualifiedName~WorkflowScenario"` |
| Build only | `dotnet build PrepperBox.slnx` |
| Coverage (lcov) | `dotnet test PrepperBox.slnx /p:CollectCoverage=true /p:CoverletOutputFormat=lcov /p:CoverletOutput=./coverage/` |

Coverlet is wired in `Directory.Build.props` for every test project: output format `lcov`, written to each project's `coverage/` folder, i.e. `PrepperBox.Db.Tests/coverage/coverage.info`, `PrepperBox.WebApi.Tests/coverage/coverage.info` and `PrepperBox.WebApi.IntegrationTests/coverage/coverage.info`. Coverage exclusions (migrations, test assemblies, `[ExcludeFromCodeCoverage]`) are in `CodeCoverage.runsettings`. In VS Code the `test dotnet coverage` task runs the whole solution with coverage.

**Important:** the solution references locally built Atom DLLs when `C:\Dev\Src\atom` exists — build the Atom solution first (`dotnet build C:\Dev\Src\atom\Atom.slnx`) if you changed anything there, or tests run against stale DLLs. A locally running app (Aspire AppHost / `PrepperBox.WebApi`) locks those DLLs in `PrepperBox.WebApi\bin\` and makes the build fail with MSB3021/MSB3027 — stop the app before building.

## Frameworks & idioms

- **xUnit v3** — note `TestContext.Current.CancellationToken`; pass it to every async repository/EF/API call (existing tests do).
- **AutoFixture + FakeItEasy** — `AutoFixture.AutoFakeItEasy` is globally `using`-imported in test projects (via `Directory.Build.props`). Use FakeItEasy (`A.Fake<T>()`, `A.CallTo(...)`) for fakes; AutoFixture for data.
- **Genius.Atom TestingUtil** — `Genius.Atom.Infrastructure.TestingUtil` provides `FakeDateTime` (`new FakeDateTime()`, `.Advance(TimeSpan)`) for deterministic time. `Genius.Atom.Data.Ef.TestingUtil` provides `BaseRepositoryTests<...>`, the base class for repository tests.
- Assertions use the built-in xUnit `Assert.*` API.
- Test classes are `public sealed`; test methods are `[Fact]` (use `[Theory]` + `[InlineData]` for parameterized cases).
- Prefer a deterministic signal over sleeping/polling when a test drives asynchronous code (see the signalling logger in `ExpirationCheckWorkerTests`).

## Structure & naming

- Namespace mirrors the project, e.g. `namespace Genius.PrepperBox.Db.Tests;`.
- Method name pattern: `MethodOrScenario_GivenSomething_WhenCondition_ThenExpectedOutcome` — parts are optional depending on the scenario (e.g. `MigrateWithBackupAsync_GivenFreshDatabase_CreatesSchemaViaMigrations`, `UpdateAsync_MovesStockToAnotherStorageLocation`).
- Body uses **Arrange / Act / Assert** comment sections.
- Integration scenario tests carry a `/* Scenario Summary + numbered Steps */` block above `[Fact]`, with matching `// Step N:` comments inline — preserve this style when extending them.

## Repository tests (`PrepperBox.Db.Tests/Repositories/`)

Repository tests derive from Atom's `BaseRepositoryTests`, which supplies the CRUD lifecycle tests (including the optimistic-concurrency conflict case) — see `Repositories/CategoriesRepositoryTests.cs`:

```csharp
public sealed class CategoriesRepositoryTests : BaseRepositoryTests<int, CategoryRef, CategoryDto,
    CreateCategoryRequest, UpdateCategoryRequest, ICategoriesRepository, PrepperBoxDbContext>
{
    // Override: CreateRepository(IDatabaseContext), CreateSampleCreateDto(), CreateSampleUpdateDto()
}
```

## Migration/schema tests (`PrepperBoxDbMigrationTests.cs`)

Cover the migrate-on-startup strategy (Atom's `IDatabaseMigrator.MigrateWithBackupAsync`):
- Real SQLite files in a `Directory.CreateTempSubdirectory` folder; dispose with `SqliteConnection.ClearAllPools()` before deleting.
- `InitialCreateMigration_ProducesSameSchemaAsEnsureCreated` is the **schema-drift guard**: if it fails after a model change, scaffold a new EF migration instead of editing existing ones — the production DB is baselined and must never re-run `InitialCreate`.
- Migrator/backup services are resolved via a minimal `ServiceCollection` (see `BuildProvider` in that file).

## Integration tests (`PrepperBox.WebApi.IntegrationTests`)

Infrastructure lives in `Infrastructure/`:
- `PrepperBoxWebApiFactory` — `WebApplicationFactory<Program>` running the real `Program.cs` (migrations and mandatory-data seeding included) against a per-factory SQLite `:memory:` connection. It runs under the `IntegrationTests` environment, so `PrepperBoxSampleDataInitializer` seeds no sample stock, disables database backups, and parks the `ExpirationCheckWorker` outside its startup window so it never fires during a test.
- `ApiScenarioClient` — typed helpers over `HttpClient` for all CRUD controllers, plus `GetJsonAsync`/`GetAsync`/`DeleteAsync`/`GetByIdsAsync`, raw `PostJsonAsync`/`PutJsonAsync` for negative cases, the route constants, and JSON extractors `Id`/`Name`/`LastModified`/`Ticks`.
- `FakeOpenFoodFactsHttpMessageHandler` — stubs the external OpenFoodFacts service (per-path JSON responses, a configurable fallback status code, and the recorded outgoing requests) so tests stay hermetic. The factory swaps it in as the primary handler of the typed client registered under the logical name `IOpenFoodFactsClient`.
- `HttpClientJsonExtensions` — `GetJsonAsync` returning a cloned `JsonElement`.

Pattern:
```csharp
using var factory = new PrepperBoxWebApiFactory();
using var httpClient = factory.CreateClient();
var api = new ApiScenarioClient(httpClient);
// ... drive endpoints through `api`, assert on returned JsonElements
```

Reuse and extend `ApiScenarioClient` and the factory rather than calling raw endpoints inline — keep scenarios readable as numbered steps.

Wire details worth remembering when asserting on payloads:
- `DateTimeOffset` is serialized as **UTC ticks** (Atom's `DateTimeOffsetTicksConverter`), and references (`CategoryRef`, `ProductRef`, …) as plain integers. Enums are integers too.
- The database stores timestamps as **Unix seconds**, so sub-second precision does not round-trip — use `ApiScenarioClient.Ticks(...)` to build the expected value.
- Optimistic concurrency: every update takes the `lastModified` token returned by the preceding create/update (or read from a GET response). A stale token surfaces as HTTP 409 with an enriched `ProblemDetails` (`title`, `entityType`, `entityId`) produced by Atom's `VersionConflictExceptionFilter` — see `VersionConflictIntegrationTests`.
- MVC JSON uses `JsonUnmappedMemberHandling.Disallow`, so a request payload must carry exactly the properties of its request record — no extras.
- Request validators must be registered under the **non-generic** `IRequestValidator` service type (`WebApi/Module.cs`); registering the closed generic silently disables them, since Atom's `RequestValidators` resolves `IEnumerable<IRequestValidator>`. `RequestValidationIntegrationTests` guards this.

Scenario coverage: `MandatoryDataIntegrationTests` (startup seeding), `WorkflowScenarioIntegrationTests` (full stock lifecycle with aggregated counters and cascaded deletes; family moved between categories), `RequestValidationIntegrationTests`, `VersionConflictIntegrationTests`, `OpenFoodFactsIntegrationTests` and `DatabaseIsolationIntegrationTests`.

## When adding tests

1. Pick the right project (repository/schema → Db.Tests; pure WebApi logic → WebApi.Tests; HTTP/workflow → IntegrationTests).
2. Match the naming, sealed-class, AAA, and (for integration) numbered-step conventions.
3. Run `dotnet test PrepperBox.slnx` and confirm green before finishing.
