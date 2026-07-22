using System.Diagnostics.CodeAnalysis;
using Genius.PrepperBox.Db.Repositories;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Genius.PrepperBox.Db
{
    [ExcludeFromCodeCoverage]
    public static class Module
    {
        public static void Configure(IServiceCollection services, IConfiguration configuration)
        {
            DatabaseContextRegistration.Register<PrepperBoxDbContext>(services)
                .WithBackup(configuration);

            // Repositories
            services.AddScoped<ICategoriesRepository, CategoriesRepository>();
            services.AddScoped<IProductFamiliesRepository, ProductFamiliesRepository>();
            services.AddScoped<IProductsRepository, ProductsRepository>();
            services.AddScoped<IStorageLocationsRepository, StorageLocationsRepository>();
            services.AddScoped<ITrackedProductsRepository, TrackedProductsRepository>();
            services.AddScoped<IConsumptionLogsRepository, ConsumptionLogsRepository>();
        }

        public static async Task InitializeAsync(IServiceProvider serviceProvider, bool isDevelopment)
        {
            using var scope = serviceProvider.CreateScope();

            // Ensure the schema is up to date, backing up before any pending migration is applied.
            // Databases created before the switch to migrations (via EnsureCreated) are baselined:
            // the InitialCreate migration is recorded as applied without being executed.
            var migrator = scope.ServiceProvider.GetRequiredService<IDatabaseMigrator>();
            await migrator.MigrateWithBackupAsync().ConfigureAwait(false);

            var dbContext = scope.ServiceProvider.GetRequiredService<PrepperBoxDbContext>();
            await PrepperBoxDbInitializer.SeedAsync(dbContext, isDevelopment).ConfigureAwait(false);
        }
    }
}
