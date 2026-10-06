namespace Genius.PrepperBox.Core.Services.ImageSearch;

/// <summary>
/// An image found by the image search.
/// </summary>
/// <param name="ImageUrl">The full-size image, hosted on the site it was found on.</param>
/// <param name="ThumbnailUrl">A small preview of the image, hosted by the search provider.</param>
/// <param name="Title">The title of the page the image was found on.</param>
/// <param name="SourcePageUrl">The page the image was found on.</param>
/// <param name="SourceName">The name of the site the image was found on.</param>
/// <param name="Width">The width of the full-size image, in pixels.</param>
/// <param name="Height">The height of the full-size image, in pixels.</param>
public sealed record ImageSearchResult(
    string ImageUrl,
    string ThumbnailUrl,
    string? Title,
    string? SourcePageUrl,
    string? SourceName,
    int? Width,
    int? Height);
