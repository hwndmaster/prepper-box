using System.Net.Http.Json;
using System.Text.Json;
using Genius.PrepperBox.Db.Models;

namespace Genius.PrepperBox.WebApi.IntegrationTests.Infrastructure;

/// <summary>
/// Typed helpers over <see cref="HttpClient"/> for driving the PrepperBox API in integration scenarios.
/// Update helpers take the optimistic-concurrency <c>lastModified</c> token returned by the preceding
/// create/update call (or read from a GET response through <see cref="LastModified"/>).
/// </summary>
internal sealed class ApiScenarioClient
{
    public const string CategoriesUri = "/api/v1/Categories";
    public const string ProductFamiliesUri = "/api/v1/ProductFamilies";
    public const string ProductsUri = "/api/v1/Products";
    public const string StorageLocationsUri = "/api/v1/StorageLocations";
    public const string TrackedProductsUri = "/api/v1/TrackedProducts";
    public const string ConsumptionLogsUri = "/api/v1/ConsumptionLogs";
    public const string OpenFoodFactsUri = "/api/v1/OpenFoodFacts";

    private readonly HttpClient _client;

    public ApiScenarioClient(HttpClient client)
    {
        _client = client;
    }

    public async Task<CreatedOrUpdatedEntity> CreateCategoryAsync(string name, string? description = null, string iconName = "other")
    {
        var response = await PostJsonAsync(CategoriesUri, new
        {
            name,
            description,
            iconName
        }).ConfigureAwait(false);

        return await ReadCreatedOrUpdatedEntityAsync(response).ConfigureAwait(false);
    }

    public async Task<CreatedOrUpdatedEntity> UpdateCategoryAsync(
        int categoryId,
        long lastModified,
        string name,
        string? description = null,
        string iconName = "other")
    {
        var response = await PutJsonAsync(CategoriesUri, new
        {
            id = categoryId,
            lastModified,
            name,
            description,
            iconName
        }).ConfigureAwait(false);

        return await ReadCreatedOrUpdatedEntityAsync(response).ConfigureAwait(false);
    }

    public async Task<CreatedOrUpdatedEntity> CreateProductFamilyAsync(
        int categoryId,
        string name,
        UnitOfMeasure unitOfMeasure = UnitOfMeasure.Piece,
        int minimumStockLevel = 0)
    {
        var response = await PostJsonAsync(ProductFamiliesUri, new
        {
            categoryId,
            name,
            unitOfMeasure,
            minimumStockLevel
        }).ConfigureAwait(false);

        return await ReadCreatedOrUpdatedEntityAsync(response).ConfigureAwait(false);
    }

    public async Task<CreatedOrUpdatedEntity> UpdateProductFamilyAsync(
        int productFamilyId,
        long lastModified,
        int categoryId,
        string name,
        UnitOfMeasure unitOfMeasure = UnitOfMeasure.Piece,
        int minimumStockLevel = 0)
    {
        var response = await PutJsonAsync(ProductFamiliesUri, new
        {
            id = productFamilyId,
            lastModified,
            categoryId,
            name,
            unitOfMeasure,
            minimumStockLevel
        }).ConfigureAwait(false);

        return await ReadCreatedOrUpdatedEntityAsync(response).ConfigureAwait(false);
    }

    public async Task<CreatedOrUpdatedEntity> CreateProductAsync(
        int familyId,
        string name,
        string? description = null,
        string? manufacturer = null,
        string? barCode = null)
    {
        var response = await PostJsonAsync(ProductsUri, new
        {
            name,
            description,
            familyId,
            manufacturer,
            barCode,
            imageUrl = (string?)null,
            imageSmallUrl = (string?)null
        }).ConfigureAwait(false);

        return await ReadCreatedOrUpdatedEntityAsync(response).ConfigureAwait(false);
    }

    public async Task<CreatedOrUpdatedEntity> UpdateProductAsync(
        int productId,
        long lastModified,
        int familyId,
        string name,
        string? description = null,
        string? manufacturer = null,
        string? barCode = null)
    {
        var response = await PutJsonAsync(ProductsUri, new
        {
            id = productId,
            lastModified,
            name,
            description,
            familyId,
            manufacturer,
            barCode,
            imageUrl = (string?)null,
            imageSmallUrl = (string?)null
        }).ConfigureAwait(false);

        return await ReadCreatedOrUpdatedEntityAsync(response).ConfigureAwait(false);
    }

    public async Task<CreatedOrUpdatedEntity> CreateStorageLocationAsync(string name)
    {
        var response = await PostJsonAsync(StorageLocationsUri, new { name }).ConfigureAwait(false);

        return await ReadCreatedOrUpdatedEntityAsync(response).ConfigureAwait(false);
    }

    public async Task<CreatedOrUpdatedEntity> UpdateStorageLocationAsync(int storageLocationId, long lastModified, string name)
    {
        var response = await PutJsonAsync(StorageLocationsUri, new
        {
            id = storageLocationId,
            lastModified,
            name
        }).ConfigureAwait(false);

        return await ReadCreatedOrUpdatedEntityAsync(response).ConfigureAwait(false);
    }

    public async Task<CreatedOrUpdatedEntity> CreateTrackedProductAsync(
        int productId,
        int storageLocationId,
        decimal quantity,
        DateTimeOffset? expirationDate = null,
        string? notes = null)
    {
        var response = await PostJsonAsync(TrackedProductsUri, new
        {
            productId,
            storageLocationId,
            expirationDate = Ticks(expirationDate),
            quantity,
            notes
        }).ConfigureAwait(false);

        return await ReadCreatedOrUpdatedEntityAsync(response).ConfigureAwait(false);
    }

    public async Task<CreatedOrUpdatedEntity> UpdateTrackedProductAsync(
        int trackedProductId,
        long lastModified,
        int productId,
        int storageLocationId,
        decimal quantity,
        DateTimeOffset? expirationDate = null,
        string? notes = null)
    {
        var response = await PutJsonAsync(TrackedProductsUri, new
        {
            id = trackedProductId,
            lastModified,
            productId,
            storageLocationId,
            expirationDate = Ticks(expirationDate),
            quantity,
            notes
        }).ConfigureAwait(false);

        return await ReadCreatedOrUpdatedEntityAsync(response).ConfigureAwait(false);
    }

    public async Task<CreatedOrUpdatedEntity> CreateConsumptionLogAsync(int productId, decimal quantity, string? reason = null)
    {
        var response = await PostJsonAsync(ConsumptionLogsUri, new
        {
            productId,
            quantity,
            reason
        }).ConfigureAwait(false);

        return await ReadCreatedOrUpdatedEntityAsync(response).ConfigureAwait(false);
    }

    public async Task<CreatedOrUpdatedEntity> UpdateConsumptionLogAsync(
        int consumptionLogId,
        long lastModified,
        int productId,
        decimal quantity,
        string? reason = null)
    {
        var response = await PutJsonAsync(ConsumptionLogsUri, new
        {
            id = consumptionLogId,
            lastModified,
            productId,
            quantity,
            reason
        }).ConfigureAwait(false);

        return await ReadCreatedOrUpdatedEntityAsync(response).ConfigureAwait(false);
    }

    public async Task<JsonElement> GetJsonAsync(string requestUri)
        => await _client.GetJsonAsync(requestUri).ConfigureAwait(false);

    public async Task<HttpResponseMessage> GetAsync(string requestUri)
        => await _client.GetAsync(requestUri, TestContext.Current.CancellationToken).ConfigureAwait(false);

    /// <summary>Reads several entities at once through the <c>by-ids</c> endpoint of a CRUD controller.</summary>
    public async Task<JsonElement> GetByIdsAsync(string controllerUri, params int[] ids)
    {
        var response = await PostJsonAsync($"{controllerUri}/by-ids", ids).ConfigureAwait(false);
        response.EnsureSuccessStatusCode();

        return await ReadJsonAsync(response).ConfigureAwait(false);
    }

    public async Task<HttpResponseMessage> PostJsonAsync<TPayload>(string requestUri, TPayload payload)
        => await _client.PostAsJsonAsync(requestUri, payload, cancellationToken: TestContext.Current.CancellationToken).ConfigureAwait(false);

    public async Task<HttpResponseMessage> PutJsonAsync<TPayload>(string requestUri, TPayload payload)
        => await _client.PutAsJsonAsync(requestUri, payload, cancellationToken: TestContext.Current.CancellationToken).ConfigureAwait(false);

    public async Task DeleteAsync(string requestUri)
    {
        var response = await _client.DeleteAsync(requestUri, TestContext.Current.CancellationToken).ConfigureAwait(false);
        response.EnsureSuccessStatusCode();
    }

    public static int Id(JsonElement element)
        => element.GetProperty("id").GetInt32();

    public static string? Name(JsonElement element)
        => element.GetProperty("name").GetString();

    public static long LastModified(JsonElement element)
        => element.GetProperty("lastModified").GetInt64();

    /// <summary>
    /// Converts a date to the tick-based representation the API uses on the wire, truncated to whole
    /// seconds — the database stores timestamps as Unix seconds, so anything finer does not round-trip.
    /// </summary>
    public static long? Ticks(DateTimeOffset? value)
        => value is null
            ? null
            : DateTimeOffset.FromUnixTimeSeconds(value.Value.ToUnixTimeSeconds()).UtcTicks;

    public static async Task<JsonElement> ReadJsonAsync(HttpResponseMessage response)
    {
        var json = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken).ConfigureAwait(false);
        using var document = JsonDocument.Parse(json);
        return document.RootElement.Clone();
    }

    private static async Task<CreatedOrUpdatedEntity> ReadCreatedOrUpdatedEntityAsync(HttpResponseMessage response)
    {
        response.EnsureSuccessStatusCode();
        var root = await ReadJsonAsync(response).ConfigureAwait(false);
        return new CreatedOrUpdatedEntity(root.GetProperty("entityId").GetInt32(), root.GetProperty("lastModified").GetInt64());
    }
}

internal sealed record CreatedOrUpdatedEntity(int EntityId, long LastModified);
