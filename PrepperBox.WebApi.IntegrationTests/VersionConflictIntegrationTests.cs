using System.Net;
using Genius.PrepperBox.WebApi.IntegrationTests.Infrastructure;

namespace Genius.PrepperBox.WebApi.IntegrationTests;

/*
 * Scenario Summary:
 * A stale optimistic-concurrency token on an update must surface as a descriptive HTTP 409 response
 * produced by Genius.Atom's VersionConflictExceptionFilter, instead of the raw 400/500 exception, and
 * the stored entity must stay untouched.
 *
 * Steps:
 * 1. Create a category.
 * 2. Update it with a stale LastModified token (a value that no longer matches the stored one).
 * 3. Validate the response is 409 Conflict with an enriched ProblemDetails (entity type and id).
 * 4. Validate the stored category was not modified, and that the current token still updates it.
 */
public sealed class VersionConflictIntegrationTests
{
    [Fact]
    public async Task UpdateWithStaleToken_ReturnsDescriptiveConflictAndKeepsStoredEntity()
    {
        // Arrange
        using var factory = new PrepperBoxWebApiFactory();
        using var httpClient = factory.CreateClient();
        var api = new ApiScenarioClient(httpClient);

        // Step 1: Create a category.
        var category = await api.CreateCategoryAsync("Conflict Category", iconName: "conflict");

        // Step 2: Update it with a stale LastModified token that no longer matches the stored one.
        var staleLastModified = category.LastModified - TimeSpan.TicksPerSecond;
        var response = await api.PutJsonAsync(ApiScenarioClient.CategoriesUri, new
        {
            id = category.EntityId,
            lastModified = staleLastModified,
            name = "Conflict Category Updated",
            description = (string?)null,
            iconName = "conflict"
        });

        // Step 3: Validate the response is a descriptive 409 Conflict.
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var problem = await ApiScenarioClient.ReadJsonAsync(response);
        Assert.Equal("Version conflict", problem.GetProperty("title").GetString());
        Assert.Equal("Category", problem.GetProperty("entityType").GetString());
        Assert.Equal(category.EntityId, problem.GetProperty("entityId").GetInt32());
        Assert.Contains("Category", problem.GetProperty("detail").GetString() ?? string.Empty, StringComparison.Ordinal);

        // Step 4: Validate the stored category was not modified, and the current token still updates it.
        var categoryDetails = await api.GetJsonAsync($"{ApiScenarioClient.CategoriesUri}/{category.EntityId}");
        Assert.Equal("Conflict Category", ApiScenarioClient.Name(categoryDetails));
        Assert.Equal(category.LastModified, ApiScenarioClient.LastModified(categoryDetails));

        await api.UpdateCategoryAsync(category.EntityId, category.LastModified, "Conflict Category Updated", iconName: "conflict");
        categoryDetails = await api.GetJsonAsync($"{ApiScenarioClient.CategoriesUri}/{category.EntityId}");
        Assert.Equal("Conflict Category Updated", ApiScenarioClient.Name(categoryDetails));
    }
}
