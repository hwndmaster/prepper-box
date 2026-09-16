using System.Diagnostics.CodeAnalysis;
using Genius.Atom.Data.Validation;
using Genius.PrepperBox.Core.Configuration;
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
                .AddTransient<IRequestValidator, CreateCategoryRequestValidator>()
                .AddTransient<IRequestValidator, CreateProductFamilyRequestValidator>();

            services.Configure<TelegramSettings>(
                configuration.GetSection(TelegramSettings.SectionName));

            services.Configure<ExpirationCheckSettings>(
                configuration.GetSection(ExpirationCheckSettings.SectionName));

            services.AddHostedService<ExpirationCheckWorker>();
        }
    }
}
