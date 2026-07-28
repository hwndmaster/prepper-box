using Genius.PrepperBox.Db;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Genius.PrepperBox.WebApi.IntegrationTests.Infrastructure;

internal sealed class PrepperBoxWebApiFactory : WebApplicationFactory<Program>
{
    /// <summary>
    /// The logical name Microsoft.Extensions.Http assigns to the typed <c>IOpenFoodFactsClient</c>
    /// registered by <see cref="Core.Module.Configure"/>.
    /// </summary>
    private const string OpenFoodFactsClientName = "IOpenFoodFactsClient";

    private readonly SqliteConnection _databaseConnection;

    public PrepperBoxWebApiFactory()
    {
        _databaseConnection = new SqliteConnection("Data Source=:memory:;Foreign Keys=True");
        _databaseConnection.Open();
    }

    public FakeOpenFoodFactsHttpMessageHandler OpenFoodFactsHttpMessageHandler { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("IntegrationTests");
        builder.ConfigureAppConfiguration((_, configurationBuilder) =>
        {
            configurationBuilder.AddInMemoryCollection(new Dictionary<string, string?>
            {
                // Keep the expiration check worker dormant: midnight already passed and the startup
                // tolerance window is closed, so it schedules itself for the next day and never runs.
                ["ExpirationCheck:NotificationTime"] = "00:00:00",
                ["ExpirationCheck:NotificationWindowMinutes"] = "0",
                ["Database:Backup:Enabled"] = "false"
            });
        });

        builder.ConfigureTestServices(services =>
        {
            services.RemoveAll<DbContextOptions<PrepperBoxDbContext>>();
            services.RemoveAll<PrepperBoxDbContext>();
            services.AddDbContext<PrepperBoxDbContext>(options => options.UseSqlite(_databaseConnection));

            // Appended last, so it wins over the primary handler the application configured.
            services.AddHttpClient(OpenFoodFactsClientName)
                .ConfigurePrimaryHttpMessageHandler(() => OpenFoodFactsHttpMessageHandler);
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);

        if (disposing)
        {
            _databaseConnection.Dispose();
        }
    }
}
