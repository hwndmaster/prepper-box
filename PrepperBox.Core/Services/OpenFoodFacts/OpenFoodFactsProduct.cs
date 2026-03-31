using System.Text.Json.Serialization;

namespace Genius.PrepperBox.Core.Services.OpenFoodFacts;

public sealed class OpenFoodFactsProduct
{
    [JsonPropertyName("code")]
    public string Code { get; set; } = string.Empty;

    [JsonPropertyName("product_name")]
    public string? ProductName { get; set; }

    [JsonPropertyName("brands")]
    public string? Brands { get; set; }

    [JsonPropertyName("categories")]
    public string? Categories { get; set; }

    [JsonPropertyName("quantity")]
    public string? Quantity { get; set; }

    [JsonPropertyName("image_front_small_url")]
    public string? ImageFrontSmallUrl { get; set; }

    [JsonPropertyName("image_url")]
    public string? ImageUrl { get; set; }

    [JsonPropertyName("nutrition_grades")]
    public string? NutritionGrade { get; set; }
}
