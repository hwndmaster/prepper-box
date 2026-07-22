using Genius.Atom.Data.Ef.Backup;
using Genius.Atom.Infrastructure.TestingUtil;
using Genius.PrepperBox.Db.Models;
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
            await context.Categories.AddAsync(Category.Create(1, "Food", "food"), TestContext.Current.CancellationToken);
            await context.SaveChangesAsync(TestContext.Current.CancellationToken);
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
