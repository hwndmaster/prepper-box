using Genius.Atom.Data.Ef.Backup;
using Genius.Atom.Infrastructure.TestingUtil;
using Genius.PrepperBox.Db.Models;
using Genius.PrepperBox.Dto.References;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;

namespace Genius.PrepperBox.Db.Tests;

/// <summary>
/// Covers the switch from <c>EnsureCreated()</c> to migrations-on-startup, in particular the
/// production scenario of a database that predates the migrations history table: the InitialCreate
/// migration must be baselined (recorded as applied), never executed against the existing schema.
/// </summary>
public sealed class PrepperBoxDbMigrationTests : IDisposable
{
    private readonly string _directory;
    private readonly string _dbPath;

    public PrepperBoxDbMigrationTests()
    {
        _directory = Directory.CreateTempSubdirectory("pb-migration-tests").FullName;
        _dbPath = Path.Combine(_directory, "PrepperBox.db");
    }

    [Fact]
    public async Task InitialCreateMigration_ProducesSameSchemaAsEnsureCreated()
    {
        // Arrange - two fresh databases: one created the legacy way (EnsureCreated, i.e. from the
        // current model) and one via the migrations pipeline. If this test fails, the model has
        // drifted from the InitialCreate migration and a new migration must be scaffolded BEFORE
        // switching production to MigrateAsync.
        var ensureCreatedDbPath = Path.Combine(_directory, "EnsureCreated.db");
        var migratedDbPath = Path.Combine(_directory, "Migrated.db");

        await using (var context = new PrepperBoxDbContext(CreateOptions(ensureCreatedDbPath)))
        {
            await context.Database.EnsureCreatedAsync(TestContext.Current.CancellationToken);
        }
        await using (var context = new PrepperBoxDbContext(CreateOptions(migratedDbPath)))
        {
            await context.Database.MigrateAsync(TestContext.Current.CancellationToken);
        }

        // Act
        var ensureCreatedSchema = DumpSchema(ensureCreatedDbPath);
        var migratedSchema = DumpSchema(migratedDbPath);

        // Assert
        Assert.Equal(ensureCreatedSchema, migratedSchema);
    }

    [Fact]
    public async Task MigrateWithBackupAsync_GivenLegacyEnsureCreatedDatabase_BaselinesWithoutRunningInitialCreate()
    {
        // Arrange - simulate the production database: schema at the InitialCreate migration but with
        // no migrations-history table (as if created via EnsureCreated before migrations existed) and
        // containing data. EnsureCreated can no longer stand in for this because it now builds the
        // current (post-AddProductFamily) schema, so bring the schema to InitialCreate explicitly and
        // then drop the history table.
        await using (var context = new PrepperBoxDbContext(CreateOptions(_dbPath)))
        {
            await context.Database.MigrateAsync("20260415184455_InitialCreate", TestContext.Current.CancellationToken);
            await context.Database.ExecuteSqlRawAsync("DROP TABLE \"__EFMigrationsHistory\";", TestContext.Current.CancellationToken);
            await context.Categories.AddAsync(Category.Create(1, "Food", "food"), TestContext.Current.CancellationToken);
            await context.SaveChangesAsync(TestContext.Current.CancellationToken);
        }

        await using var provider = BuildProvider(_dbPath);

        // Act - if InitialCreate were executed instead of baselined, the CREATE TABLE statements
        // would fail against the existing schema.
        using (var scope = provider.CreateScope())
        {
            var migrator = scope.ServiceProvider.GetRequiredService<IDatabaseMigrator>();
            await migrator.MigrateWithBackupAsync(TestContext.Current.CancellationToken);
        }

        // Assert - InitialCreate is recorded as applied and the existing data survived
        await using (var context = new PrepperBoxDbContext(CreateOptions(_dbPath)))
        {
            var applied = (await context.Database.GetAppliedMigrationsAsync(TestContext.Current.CancellationToken)).ToList();
            Assert.Contains(applied, id => id.EndsWith("_InitialCreate", StringComparison.Ordinal));

            var category = await context.Categories.SingleAsync(TestContext.Current.CancellationToken);
            Assert.Equal("Food", category.Name);
        }
    }

    [Fact]
    public async Task MigrateWithBackupAsync_GivenFreshDatabase_CreatesSchemaViaMigrations()
    {
        // Arrange
        await using var provider = BuildProvider(_dbPath);

        // Act
        using (var scope = provider.CreateScope())
        {
            var migrator = scope.ServiceProvider.GetRequiredService<IDatabaseMigrator>();
            await migrator.MigrateWithBackupAsync(TestContext.Current.CancellationToken);
        }

        // Assert - schema is usable and the migration is recorded
        await using (var context = new PrepperBoxDbContext(CreateOptions(_dbPath)))
        {
            var applied = (await context.Database.GetAppliedMigrationsAsync(TestContext.Current.CancellationToken)).ToList();
            Assert.Contains(applied, id => id.EndsWith("_InitialCreate", StringComparison.Ordinal));
            Assert.Contains(applied, id => id.EndsWith("_AddProductFamily", StringComparison.Ordinal));
            Assert.Contains(applied, id => id.EndsWith("_ProductFamilyDecimalMinimumStockLevel", StringComparison.Ordinal));
            await context.Categories.AddAsync(Category.Create(1, "Food", "food"), TestContext.Current.CancellationToken);
            await context.SaveChangesAsync(TestContext.Current.CancellationToken);
        }
    }

    [Fact]
    public async Task ProductFamilyDecimalMinimumStockLevelMigration_PreservesExistingLevelsAndAcceptsFractions()
    {
        // Arrange - a database at the previous migration, where MinimumStockLevel is still an integer
        // column, holding a family with a whole-number level.
        await using (var context = new PrepperBoxDbContext(CreateOptions(_dbPath)))
        {
            await context.Database.MigrateAsync("20260720171029_AddProductFamily", TestContext.Current.CancellationToken);
            await context.Database.ExecuteSqlRawAsync("""
                INSERT INTO "Categories" ("Id", "Name", "Description", "IconName", "DateCreated", "LastModified")
                VALUES (1, 'Food', NULL, 'food', 0, 0);
                INSERT INTO "ProductFamilies" ("Id", "CategoryId", "Name", "UnitOfMeasure", "MinimumStockLevel", "DateCreated", "LastModified")
                VALUES (100, 1, 'Canned fish', 2, 6, 0, 0);
                """, TestContext.Current.CancellationToken);
        }

        // Act
        await using (var context = new PrepperBoxDbContext(CreateOptions(_dbPath)))
        {
            await context.Database.MigrateAsync(TestContext.Current.CancellationToken);
        }

        // Assert - the existing level survived and a fractional level can now be stored
        await using (var context = new PrepperBoxDbContext(CreateOptions(_dbPath)))
        {
            var migrated = await context.ProductFamilies.SingleAsync(TestContext.Current.CancellationToken);
            Assert.Equal(6m, migrated.MinimumStockLevel);

            await context.ProductFamilies.AddAsync(
                ProductFamily.Create(new ProductFamilyRef(101), new CategoryRef(1), "Rice", UnitOfMeasure.Kilogram, 0.5m),
                TestContext.Current.CancellationToken);
            await context.SaveChangesAsync(TestContext.Current.CancellationToken);
        }

        await using (var context = new PrepperBoxDbContext(CreateOptions(_dbPath)))
        {
            var fractional = await context.ProductFamilies
                .SingleAsync(f => f.Name == "Rice", TestContext.Current.CancellationToken);
            Assert.Equal(0.5m, fractional.MinimumStockLevel);
        }
    }

    public void Dispose()
    {
        SqliteConnection.ClearAllPools();
        try
        {
            Directory.Delete(_directory, recursive: true);
        }
        catch (IOException)
        {
            // Best effort cleanup of the temp directory.
        }
    }

    private static DbContextOptions<PrepperBoxDbContext> CreateOptions(string dbPath)
    {
        return new DbContextOptionsBuilder<PrepperBoxDbContext>()
            .UseSqlite($"Data Source={dbPath}")
            .Options;
    }

    private static ServiceProvider BuildProvider(string dbPath)
    {
        var services = new ServiceCollection();
        services.AddDbContext<PrepperBoxDbContext>(options => options.UseSqlite($"Data Source={dbPath}"));
        DatabaseContextRegistration.Register<PrepperBoxDbContext>(services)
            .WithBackup(new DatabaseBackupOptions());
        services.AddSingleton<IDateTime>(new FakeDateTime());
        services.AddSingleton(typeof(ILogger<>), typeof(NullLogger<>));
        return services.BuildServiceProvider();
    }

    private static string DumpSchema(string dbPath)
    {
        using var connection = new SqliteConnection($"Data Source={dbPath};Mode=ReadOnly;Pooling=False");
        connection.Open();
        using var command = connection.CreateCommand();
        command.CommandText = """
            SELECT name, sql FROM sqlite_master
            WHERE sql IS NOT NULL
            ORDER BY name;
            """;
        using var reader = command.ExecuteReader();
        var statements = new List<string>();
        while (reader.Read())
        {
            var name = reader.GetString(0);
            // Skip SQLite internals and EF's own migrations bookkeeping - only the actual schema matters.
            if (name.StartsWith("sqlite_", StringComparison.Ordinal)
                || name.StartsWith("__EF", StringComparison.Ordinal))
            {
                continue;
            }

            statements.Add(reader.GetString(1));
        }

        return string.Join("\n\n", statements);
    }
}
