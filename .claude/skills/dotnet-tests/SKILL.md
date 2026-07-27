---
name: dotnet-tests
description: Conventions and commands for the .NET test suite of the PrepperBox solution (xUnit v3, AutoFixture + FakeItEasy, Genius.Atom TestingUtil, EF Core SQLite). Use whenever writing, editing, running, or debugging tests in PrepperBox.Db.Tests.
---

# PrepperBox .NET tests

The solution (`PrepperBox.slnx`) has a single test project: **`PrepperBox.Db.Tests`**. Root namespace prefix is `Genius.PrepperBox.*`. Central package versions live in `Directory.Packages.props`; shared build/test wiring comes from the Atom framework's `Genius.Atom.Build.props` (imported via `Directory.Build.props`).

There is no WebApi.Tests or IntegrationTests project (yet) — pure-logic and HTTP-level tests have no home; if one is needed, mirror the structure used in the sibling buddy-kenteken repo.

## Commands

| Task | Command (cwd = repo root) |
|------|---------------------------|
| Run all tests | `dotnet test PrepperBox.slnx` |
| Run the test project directly | `dotnet test PrepperBox.Db.Tests` |
| Filter by name | `dotnet test --filter "FullyQualifiedName~Migration"` |
| Build only | `dotnet build PrepperBox.slnx` |

No code-coverage collection is wired up in this repo.

**Important:** the solution references locally built Atom DLLs when `C:\Dev\Src\atom` exists — build the Atom solution first (`dotnet build C:\Dev\Src\atom\Atom.slnx`) if you changed anything there, or tests run against stale DLLs.

## Frameworks & idioms

- **xUnit v3** — note `TestContext.Current.CancellationToken`; pass it to every async repository/EF call (existing tests do).
- **AutoFixture + FakeItEasy** — `AutoFixture.AutoFakeItEasy` is globally `using`-imported in test projects (via `Directory.Build.props`). Use FakeItEasy (`A.Fake<T>()`, `A.CallTo(...)`) for fakes; AutoFixture for data.
- **Genius.Atom TestingUtil** — `Genius.Atom.Infrastructure.TestingUtil` provides `FakeDateTime` (`new FakeDateTime()`, `.Advance(TimeSpan)`) for deterministic time. `Genius.Atom.Data.Ef.TestingUtil` provides `BaseRepositoryTests<...>`, the base class for repository tests.
- Assertions use the built-in xUnit `Assert.*` API.
- Test classes are `public sealed`; test methods are `[Fact]` (use `[Theory]` + `[InlineData]` for parameterized cases).

## Structure & naming

- Namespace mirrors the project, e.g. `namespace Genius.PrepperBox.Db.Tests;`.
- Method name pattern: `MethodOrScenario_GivenSomething_WhenCondition_ThenExpectedOutcome` — parts are optional depending on the scenario (e.g. `MigrateWithBackupAsync_GivenFreshDatabase_CreatesSchemaViaMigrations`).
- Body uses **Arrange / Act / Assert** comment sections.

## Repository tests (`Repositories/`)

Repository tests derive from Atom's `BaseRepositoryTests`, which supplies the CRUD lifecycle tests — see `Repositories/CategoriesRepositoryTests.cs`:

```csharp
public sealed class CategoriesRepositoryTests : BaseRepositoryTests<int, CategoryRef, CategoryDto,
    CreateCategoryRequest, UpdateCategoryRequest, ICategoriesRepository, PrepperBoxDbContext>
{
    // Override: CreateRepository(IDatabaseContext), CreateSampleCreateDto(), CreateSampleUpdateDto()
}
```

Only the Categories repository has tests today; when adding tests for the other repositories (Products, StorageLocations, TrackedProducts, ConsumptionLogs), follow the same base-class pattern.

## Migration/schema tests (`PrepperBoxDbMigrationTests.cs`)

Cover the migrate-on-startup strategy (Atom's `IDatabaseMigrator.MigrateWithBackupAsync`):
- Real SQLite files in a `Directory.CreateTempSubdirectory` folder; dispose with `SqliteConnection.ClearAllPools()` before deleting.
- `InitialCreateMigration_ProducesSameSchemaAsEnsureCreated` is the **schema-drift guard**: if it fails after a model change, scaffold a new EF migration instead of editing existing ones — the production DB is baselined and must never re-run `InitialCreate`.
- Migrator/backup services are resolved via a minimal `ServiceCollection` (see `BuildProvider` in that file).

## When adding tests

1. Repository behavior → derive from `BaseRepositoryTests`; schema/migration behavior → extend `PrepperBoxDbMigrationTests` patterns.
2. Match the naming, sealed-class, and AAA conventions.
3. Run `dotnet test PrepperBox.slnx` and confirm green before finishing.
