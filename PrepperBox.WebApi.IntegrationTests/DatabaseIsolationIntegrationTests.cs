using Genius.PrepperBox.WebApi.IntegrationTests.Infrastructure;

namespace Genius.PrepperBox.WebApi.IntegrationTests;

public sealed class DatabaseIsolationIntegrationTests
{
    /*
     * Scenario Summary:
     * Verifies per-factory SQLite in-memory isolation between independent test hosts.
     *
     * Steps:
     * 1. Create two independent Web API factories (two in-memory databases).
     * 2. Create a category through the first API client.
     * 3. Read categories from both API clients.
     * 4. Assert the created category exists only in the first database.
     */
    [Fact]
    public async Task EachFactoryInstance_UsesSeparateInMemoryDatabase()
    {
        // Arrange
        using var firstFactory = new PrepperBoxWebApiFactory();
        using var firstClient = firstFactory.CreateClient();
        using var secondFactory = new PrepperBoxWebApiFactory();
        using var secondClient = secondFactory.CreateClient();
        var firstApi = new ApiScenarioClient(firstClient);

        // Act
        await firstApi.CreateCategoryAsync("Isolation Category", iconName: "isolation");
        var firstCategories = await firstClient.GetJsonAsync(ApiScenarioClient.CategoriesUri);
        var secondCategories = await secondClient.GetJsonAsync(ApiScenarioClient.CategoriesUri);

        // Assert
        Assert.Contains(firstCategories.EnumerateArray(), category => ApiScenarioClient.Name(category) == "Isolation Category");
        Assert.DoesNotContain(secondCategories.EnumerateArray(), category => ApiScenarioClient.Name(category) == "Isolation Category");
    }
}
