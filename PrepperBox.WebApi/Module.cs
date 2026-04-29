using System.Collections;
using System.Diagnostics.CodeAnalysis;
using System.Text;
using Genius.Atom.Data.Validation;
using Genius.PrepperBox.Core.Configuration;
using Genius.PrepperBox.Dto.RequestMessages;
using Genius.PrepperBox.WebApi.BackgroundWorkers;
using Genius.PrepperBox.WebApi.Validators;

namespace Genius.PrepperBox.WebApi
{
    [ExcludeFromCodeCoverage]
    public static class Module
    {
        public static void Configure(IServiceCollection services, IConfiguration configuration)
        {
            Guard.NotNull(configuration);

            services
                .AddTransient<IRequestValidator<CreateCategoryRequest>, CreateCategoryRequestValidator>();

            services.Configure<TelegramSettings>(
                configuration.GetSection(TelegramSettings.SectionName));

            services.Configure<ExpirationCheckSettings>(
                configuration.GetSection(ExpirationCheckSettings.SectionName));

            services.AddHostedService<ExpirationCheckWorker>();
        }

        public static void Initialize(IServiceProvider serviceProvider)
        {
            var logger = serviceProvider.GetRequiredService<ILogger<Program>>();
            LogEnvironmentVariables(logger);
        }

        private static void LogEnvironmentVariables(ILogger logger)
        {
            if (logger.IsEnabled(LogLevel.Debug))
            {
                StringBuilder envVars = new();
                foreach (DictionaryEntry env in Environment.GetEnvironmentVariables())
                {
                    envVars.AppendLine(
                        System.Globalization.CultureInfo.InvariantCulture,
                        $"{env.Key}={env.Value}");
                }

                logger.LogDebug("Environment variables:\n{EnvVars}", envVars);
            }
        }
    }
}
