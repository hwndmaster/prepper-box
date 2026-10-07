using System.Diagnostics.CodeAnalysis;
using System.Reflection;
using Genius.PrepperBox.Core.Services.ImageSearch;
using Genius.PrepperBox.Core.Services.OpenFoodFacts;
using Genius.PrepperBox.Core.Services.Telegram;
using Microsoft.Extensions.DependencyInjection;

namespace Genius.PrepperBox.Core
{
    [ExcludeFromCodeCoverage]
    public static class Module
    {
        /// <summary>
        /// The <c>Version</c> from Directory.Build.props. The SDK appends "+&lt;commit&gt;" to the informational
        /// version, which the user agent does not need.
        /// </summary>
        private static readonly string ProductVersion =
            typeof(Module).Assembly.GetCustomAttribute<AssemblyInformationalVersionAttribute>()?.InformationalVersion.Split('+')[0]
            ?? "0.0.0";

        public static void Configure(IServiceCollection services)
        {
            services.AddHttpClient<IOpenFoodFactsClient, OpenFoodFactsClient>(client =>
            {
                client.BaseAddress = new Uri("https://world.openfoodfacts.org");
                client.DefaultRequestHeaders.UserAgent.ParseAdd($"PrepperBox/{ProductVersion} (https://github.com/hwndmaster/prepper-box)");
            });

            services.AddHttpClient<IImageSearchClient, SerpApiImageSearchClient>(client =>
            {
                client.BaseAddress = new Uri("https://serpapi.com");
            });

            services.AddHttpClient<ITelegramNotificationService, TelegramNotificationService>();
        }

        public static void Initialize(IServiceProvider serviceProvider)
        {
            // Run background workers here
        }
    }
}
