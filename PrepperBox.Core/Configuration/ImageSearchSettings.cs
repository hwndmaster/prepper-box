namespace Genius.PrepperBox.Core.Configuration;

/// <summary>
/// Configuration for the product image search, backed by SerpApi's Google Images engine.
/// </summary>
public sealed class ImageSearchSettings
{
    public const string SectionName = "ImageSearch";

    /// <summary>
    /// The SerpApi private API key (https://serpapi.com/manage-api-key).
    /// </summary>
    public string? SerpApiKey { get; set; }

    /// <summary>
    /// Whether the image search is enabled.
    /// </summary>
    public bool IsConfigured => !string.IsNullOrWhiteSpace(SerpApiKey);
}
