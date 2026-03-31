using System.Diagnostics.CodeAnalysis;
using Genius.PrepperBox.Db.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Genius.PrepperBox.Db
{
    [ExcludeFromCodeCoverage]
    public static class Module
    {
        public static void Configure(IServiceCollection services)
        {
            services.AddTransient<IDbContextProvider, DbContextProvider>();

            // Repositories
            services.AddTransient<ICategoriesRepository, CategoriesRepository>();
            services.AddTransient<IProductsRepository, ProductsRepository>();
            services.AddTransient<IStorageLocationsRepository, StorageLocationsRepository>();
            services.AddTransient<ITrackedProductsRepository, TrackedProductsRepository>();
            services.AddTransient<IConsumptionLogsRepository, ConsumptionLogsRepository>();
        }

        public static async Task InitializeAsync(IServiceProvider serviceProvider, bool isDevelopment)
        {
            using var scope = serviceProvider.CreateScope();
            var options = scope.ServiceProvider.GetRequiredService<DbContextOptions<PrepperBoxDbContext>>();
            await using var dbContext = new PrepperBoxDbContext(options);
            await PrepperBoxDbInitializer.SeedAsync(dbContext, isDevelopment);
        }
    }
}
