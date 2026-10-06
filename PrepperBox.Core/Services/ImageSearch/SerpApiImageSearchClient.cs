using System.Net.Http.Json;
using Genius.PrepperBox.Core.Configuration;
using Microsoft.Extensions.Options;

namespace Genius.PrepperBox.Core.Services.ImageSearch;

/// <summary>
/// Searches Google Images through SerpApi (https://serpapi.com/google-images-api).
/// </summary>
internal sealed class SerpApiImageSearchClient : IImageSearchClient
{
    /// <summary>
    /// A Google Images page carries about a hundred results; the picker only needs the best few dozen.
    /// </summary>
    private const int MaxResults = 50;

    private readonly HttpClient _httpClient;
    private readonly ImageSearchSettings _settings;

    public SerpApiImageSearchClient(HttpClient httpClient, IOptions<ImageSearchSettings> settings)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
    }

    public bool IsConfigured => _settings.IsConfigured;

    public async Task<IReadOnlyList<ImageSearchResult>> SearchAsync(string query, CancellationToken cancellationToken = default)
    {
        if (!IsConfigured)
        {
            throw new InvalidOperationException("The image search is not configured.");
        }

        // SerpApi takes the key as a query parameter only. It still stays out of the logs and traces:
        // since .NET 9, IHttpClientFactory logging and HttpClient telemetry replace the query string with "*".
        var url = $"/search.json?engine=google_images&q={Uri.EscapeDataString(query.Trim())}&api_key={Uri.EscapeDataString(_settings.SerpApiKey!)}";

        var response = await _httpClient.GetFromJsonAsync<SerpApiImagesResponse>(url, cancellationToken).ConfigureAwait(false);

        return (response?.ImagesResults ?? [])
            // The app is served over HTTPS, where browsers block or force-upgrade plain-HTTP images, so an
            // http:// URL picked as the product image would often render broken.
            .Where(x => x.Original?.StartsWith("https://", StringComparison.OrdinalIgnoreCase) == true)
            .DistinctBy(x => x.Original, StringComparer.Ordinal)
            .Take(MaxResults)
            .Select(x => new ImageSearchResult(
                ImageUrl: x.Original!,
                ThumbnailUrl: x.Thumbnail ?? x.Original!,
                Title: x.Title,
                SourcePageUrl: x.Link,
                SourceName: x.Source,
                Width: x.OriginalWidth,
                Height: x.OriginalHeight))
            .ToArray();
    }
}
