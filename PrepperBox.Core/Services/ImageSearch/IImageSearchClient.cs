namespace Genius.PrepperBox.Core.Services.ImageSearch;

/// <summary>
/// Searches the web for images, used to pick a product image when OpenFoodFacts has none.
/// </summary>
public interface IImageSearchClient
{
    /// <summary>
    /// Whether the search provider is configured. When it is not, <see cref="SearchAsync"/> must not be called.
    /// </summary>
    bool IsConfigured { get; }

    /// <summary>
    /// Searches for images matching the query.
    /// </summary>
    /// <param name="query">The search terms, e.g. the product manufacturer and name.</param>
    /// <param name="cancellationToken">A cancellation token.</param>
    /// <returns>The images found, in the provider's ranking order.</returns>
    /// <exception cref="HttpRequestException">The search provider rejected the request or failed.</exception>
    Task<IReadOnlyList<ImageSearchResult>> SearchAsync(string query, CancellationToken cancellationToken = default);
}
