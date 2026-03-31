using System.Diagnostics.CodeAnalysis;
using Genius.Atom.Data.Validation;
using Genius.PrepperBox.Dto.RequestMessages;
using Genius.PrepperBox.WebApi.Validators;

namespace Genius.PrepperBox.WebApi
{
    [ExcludeFromCodeCoverage]
    public static class Module
    {
        public static void Configure(IServiceCollection services)
        {
            services
                .AddTransient<IRequestValidator<CreateCategoryRequest>, CreateCategoryRequestValidator>();
        }

        public static void Initialize(IServiceProvider serviceProvider)
        {
            // Run background workers here
        }
    }
}
