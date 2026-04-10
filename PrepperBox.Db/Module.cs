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
            DatabaseContextRegistration.Register<PrepperBoxDbContext>(services);

            // Repositories
            services.AddScoped<ICategoriesRepository, CategoriesRepository>();
            services.AddScoped<IProductsRepository, ProductsRepository>();
            services.AddScoped<IStorageLocationsRepository, StorageLocationsRepository>();
            services.AddScoped<ITrackedProductsRepository, TrackedProductsRepository>();
            services.AddScoped<IConsumptionLogsRepository, ConsumptionLogsRepository>();
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
