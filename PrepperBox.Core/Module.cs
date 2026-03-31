using System.Diagnostics.CodeAnalysis;
using Genius.PrepperBox.Core.Services.OpenFoodFacts;
using Microsoft.Extensions.DependencyInjection;

namespace Genius.PrepperBox.Core
{
    [ExcludeFromCodeCoverage]
    public static class Module
    {
        public static void Configure(IServiceCollection services)
        {
            services.AddHttpClient<IOpenFoodFactsClient, OpenFoodFactsClient>(client =>
            {
                client.BaseAddress = new Uri("https://world.openfoodfacts.org");
                client.DefaultRequestHeaders.UserAgent.ParseAdd("PrepperBox/0.0.1 (https://github.com/hwndmaster/prepper-box)");
            });
        }

        public static void Initialize(IServiceProvider serviceProvider)
        {
            // Run background workers here
        }
    }
}
