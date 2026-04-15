using System.Globalization;
using System.Net.Http.Json;
using System.Text.RegularExpressions;
using Genius.PrepperBox.Db.Models;

namespace Genius.PrepperBox.Core.Services.OpenFoodFacts;

public interface IOpenFoodFactsClient
{
    OpenFoodFactsQuantity? ExtractQuantity(string? quantityString);
    Task<IEnumerable<OpenFoodFactsProduct>> SearchProductsAsync(string query, CancellationToken cancellationToken = default);
    Task<OpenFoodFactsProduct?> SearchProductsByBarCodeAsync(string barCode, CancellationToken cancellationToken = default);
}

internal sealed class OpenFoodFactsClient : IOpenFoodFactsClient
{
    private const string ProductFields = "code,product_name,brands,categories,quantity,image_url,image_small_url";

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

    public OpenFoodFactsQuantity? ExtractQuantity(string? quantityString)
    {
        if (string.IsNullOrWhiteSpace(quantityString))
        {
            return null;
        }

        // Strip parenthetical groups like "(42 x 15 g)" and trim
        var cleaned = Regex.Replace(quantityString.Trim(), @"\(.*?\)", "").Trim();

        // Match a leading number (int or decimal with . or ,) optionally separated by whitespace from a unit
        var match = Regex.Match(cleaned, @"^(\d+(?:[.,]\d+)?)\s*([a-zA-Z]+)", RegexOptions.IgnoreCase);
        if (!match.Success)
        {
            return null;
        }

        var valueStr = match.Groups[1].Value.Replace(',', '.');
        if (!decimal.TryParse(valueStr, NumberStyles.Any, CultureInfo.InvariantCulture, out var rawValue))
        {
            return null;
        }

        var unit = match.Groups[2].Value.ToLowerInvariant();

        return unit switch
        {
            "g"  => new OpenFoodFactsQuantity(rawValue / 1000m, UnitOfMeasure.Kilogram),
            "kg" => new OpenFoodFactsQuantity(rawValue, UnitOfMeasure.Kilogram),
            "l"  => new OpenFoodFactsQuantity(rawValue, UnitOfMeasure.Liter),
            "cl" => new OpenFoodFactsQuantity(rawValue / 100m, UnitOfMeasure.Liter),
            "ml" => new OpenFoodFactsQuantity(rawValue / 1000m, UnitOfMeasure.Liter),
            _    => null,
        };
    }
}
