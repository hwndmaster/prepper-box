using System.Text.Json.Serialization;

namespace Genius.PrepperBox.Core.Services.OpenFoodFacts;

internal sealed class OpenFoodFactsSearchResponse
{
    [JsonPropertyName("products")]
    public List<OpenFoodFactsProduct> Products { get; set; } = [];
}
