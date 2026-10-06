using System.Text.Json.Serialization;

namespace Genius.PrepperBox.Core.Services.ImageSearch;

/// <summary>
/// The subset of a SerpApi Google Images response (https://serpapi.com/google-images-api) the app reads.
/// </summary>
internal sealed class SerpApiImagesResponse
{
    /// <summary>
    /// Absent when Google found nothing: SerpApi then answers 200 with only an "error" message.
    /// </summary>
    [JsonPropertyName("images_results")]
    public List<SerpApiImageResult>? ImagesResults { get; set; }
}

internal sealed class SerpApiImageResult
{
    [JsonPropertyName("original")]
    public string? Original { get; set; }

    [JsonPropertyName("original_width")]
    public int? OriginalWidth { get; set; }

    [JsonPropertyName("original_height")]
    public int? OriginalHeight { get; set; }

    [JsonPropertyName("thumbnail")]
    public string? Thumbnail { get; set; }

    [JsonPropertyName("title")]
    public string? Title { get; set; }

    [JsonPropertyName("link")]
    public string? Link { get; set; }

    [JsonPropertyName("source")]
    public string? Source { get; set; }
}
