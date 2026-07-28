using Genius.PrepperBox.Db.Models;
using Genius.PrepperBox.WebApi.IntegrationTests.Infrastructure;

namespace Genius.PrepperBox.WebApi.IntegrationTests;

public sealed class MandatoryDataIntegrationTests
{
    /*
     * Scenario Summary:
     * Validates startup seeding behavior outside the Development environment, where only the mandatory
     * reference data must be created and no sample stock.
     *
     * Steps:
     * 1. Start the Web API using the integration test factory.
     * 2. Read categories, product families and storage locations through public API endpoints.
     * 3. Assert the mandatory categories and storage locations exist.
     * 4. Assert the mandatory product families exist and are wired to their category (Food -> Soups).
     * 5. Assert no sample products or stock were seeded.
     */
    [Fact]
    public async Task Startup_SeedsMandatoryDataWithoutSampleStock()
    {
        // Arrange
        using var factory = new PrepperBoxWebApiFactory();
        using var client = factory.CreateClient();

        // Act
        var categories = await client.GetJsonAsync(ApiScenarioClient.CategoriesUri);
        var productFamilies = await client.GetJsonAsync(ApiScenarioClient.ProductFamiliesUri);
        var storageLocations = await client.GetJsonAsync(ApiScenarioClient.StorageLocationsUri);
        var products = await client.GetJsonAsync(ApiScenarioClient.ProductsUri);
        var trackedProducts = await client.GetJsonAsync(ApiScenarioClient.TrackedProductsUri);

        // Assert
        Assert.Equal(
            ["Cooking", "Cooper", "Food", "Medical Supplies", "Other", "Water"],
            SortedNames(categories));
        Assert.Equal(
            ["Attic", "Barn", "Garderobe", "Harry Potter room"],
            SortedNames(storageLocations));

        Assert.Equal(15, productFamilies.GetArrayLength());
        var foodCategoryId = ApiScenarioClient.Id(categories.EnumerateArray().Single(category => ApiScenarioClient.Name(category) == "Food"));
        var soups = productFamilies.EnumerateArray().Single(family => ApiScenarioClient.Name(family) == "Soups");
        Assert.Equal(foodCategoryId, soups.GetProperty("categoryId").GetInt32());
        Assert.Equal((int)UnitOfMeasure.Can, soups.GetProperty("unitOfMeasure").GetInt32());
        Assert.Equal(0, soups.GetProperty("productsCount").GetInt32());

        Assert.Empty(products.EnumerateArray());
        Assert.Empty(trackedProducts.EnumerateArray());
    }

    private static string[] SortedNames(System.Text.Json.JsonElement array)
        => array.EnumerateArray()
            .Select(element => ApiScenarioClient.Name(element) ?? string.Empty)
            .Order(StringComparer.Ordinal)
            .ToArray();
}
