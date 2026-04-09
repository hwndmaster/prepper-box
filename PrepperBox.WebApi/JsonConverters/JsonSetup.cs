using System.Text.Json;
using Genius.Atom.Data.JsonConverters;
using Genius.PrepperBox.Dto.References;

namespace Genius.PrepperBox.WebApi.JsonConverters
{
    public static class JsonSetup
    {
        public static void SetupJsonOptions(JsonSerializerOptions options)
        {
            Guard.NotNull(options);

            options.Converters.Add(new ReferenceConverter<CategoryRef>());
            options.Converters.Add(new ReferenceConverter<ConsumptionLogRef>());
            options.Converters.Add(new ReferenceConverter<ProductRef>());
            options.Converters.Add(new ReferenceConverter<StorageLocationRef>());
            options.Converters.Add(new ReferenceConverter<TrackedProductRef>());
        }
    }
}
