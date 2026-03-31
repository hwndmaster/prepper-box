using System.Text.Json.Serialization;

namespace Genius.PrepperBox.Core.Services.OpenFoodFacts;

internal sealed class OpenFoodFactsProductResponse
{
    [JsonPropertyName("product")]
    public OpenFoodFactsProduct? Product { get; set; }

    [JsonPropertyName("status")]
    public int Status { get; set; }
}
