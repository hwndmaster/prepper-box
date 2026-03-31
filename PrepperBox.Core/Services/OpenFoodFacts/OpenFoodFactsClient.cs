using System.Net.Http.Json;

namespace Genius.PrepperBox.Core.Services.OpenFoodFacts;

public interface IOpenFoodFactsClient
{
    Task<IEnumerable<OpenFoodFactsProduct>> SearchProductsAsync(string query, CancellationToken cancellationToken = default);
    Task<OpenFoodFactsProduct?> SearchProductsByBarCodeAsync(string barCode, CancellationToken cancellationToken = default);
}

internal sealed class OpenFoodFactsClient : IOpenFoodFactsClient
{
    private const string ProductFields = "code,product_name,brands,categories,quantity,image_front_small_url,image_url,nutrition_grades";

    private readonly HttpClient _httpClient;

    public OpenFoodFactsClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<IEnumerable<OpenFoodFactsProduct>> SearchProductsAsync(string query, CancellationToken cancellationToken = default)
    {
        var encodedQuery = Uri.EscapeDataString(query);
        var url = $"/cgi/search.pl?search_terms={encodedQuery}&search_simple=1&action=process&json=true&page_size=50&fields={ProductFields}";

        var response = await _httpClient.GetFromJsonAsync<OpenFoodFactsSearchResponse>(url, cancellationToken).ConfigureAwait(false);

        return response?.Products ?? [];
    }

    public async Task<OpenFoodFactsProduct?> SearchProductsByBarCodeAsync(string barCode, CancellationToken cancellationToken = default)
    {
        var url = $"/api/v2/product/{Uri.EscapeDataString(barCode)}?fields={ProductFields}";

        var response = await _httpClient.GetFromJsonAsync<OpenFoodFactsProductResponse>(url, cancellationToken).ConfigureAwait(false);

        if (response?.Status == 1 && response.Product is not null)
        {
            return response.Product;
        }

        return null;
    }
}
