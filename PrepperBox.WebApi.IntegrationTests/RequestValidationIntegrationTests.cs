using System.Net;
using Genius.PrepperBox.Db.Models;
using Genius.PrepperBox.WebApi.IntegrationTests.Infrastructure;

namespace Genius.PrepperBox.WebApi.IntegrationTests;

public sealed class RequestValidationIntegrationTests
{
    /*
     * Scenario Summary:
     * The registered create-request validators must reject duplicate names through an HTTP 400
     * validation problem, before the database unique constraints are hit.
     *
     * Steps:
     * 1. Read the seeded categories and pick the mandatory "Food" one.
     * 2. Create a category reusing the seeded name and assert a validation problem for "Name".
     * 3. Assert no extra category was created.
     */
    [Fact]
    public async Task CreateCategory_WithAlreadyUsedName_ReturnsValidationProblem()
    {
        // Arrange
        using var factory = new PrepperBoxWebApiFactory();
        using var httpClient = factory.CreateClient();
        var api = new ApiScenarioClient(httpClient);

        // Step 1: Read the seeded categories.
        var categoriesBefore = await api.GetJsonAsync(ApiScenarioClient.CategoriesUri);
        var seededCount = categoriesBefore.GetArrayLength();

        // Step 2: Create a category reusing the seeded name.
        var response = await api.PostJsonAsync(ApiScenarioClient.CategoriesUri, new
        {
            name = "Food",
            description = (string?)null,
            iconName = "food"
        });

        // Step 3: Assert the validation problem and that nothing was created.
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await ApiScenarioClient.ReadJsonAsync(response);
        var nameErrors = problem.GetProperty("errors").GetProperty("Name").EnumerateArray().Select(error => error.GetString() ?? string.Empty).ToArray();
        Assert.Equal(["A category with name 'Food' already exists."], nameErrors);

        var categoriesAfter = await api.GetJsonAsync(ApiScenarioClient.CategoriesUri);
        Assert.Equal(seededCount, categoriesAfter.GetArrayLength());
    }

    /*
     * Scenario Summary:
     * Product family names are only required to be unique within their own category.
     *
     * Steps:
     * 1. Create two categories.
     * 2. Create a product family in the first category.
     * 3. Create a family with the same name in the first category and assert a validation problem.
     * 4. Create a family with the same name in the second category and assert it succeeds.
     */
    [Fact]
    public async Task CreateProductFamily_EnforcesNameUniquenessPerCategoryOnly()
    {
        // Arrange
        using var factory = new PrepperBoxWebApiFactory();
        using var httpClient = factory.CreateClient();
        var api = new ApiScenarioClient(httpClient);

        // Step 1: Create two categories.
        var firstCategory = await api.CreateCategoryAsync("Validation First", iconName: "first");
        var secondCategory = await api.CreateCategoryAsync("Validation Second", iconName: "second");

        // Step 2: Create a product family in the first category.
        await api.CreateProductFamilyAsync(firstCategory.EntityId, "Misc (Pieces)", UnitOfMeasure.Piece);

        // Step 3: The same name in the same category is rejected.
        var response = await api.PostJsonAsync(ApiScenarioClient.ProductFamiliesUri, new
        {
            categoryId = firstCategory.EntityId,
            name = "Misc (Pieces)",
            unitOfMeasure = UnitOfMeasure.Piece,
            minimumStockLevel = 0
        });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await ApiScenarioClient.ReadJsonAsync(response);
        var nameErrors = problem.GetProperty("errors").GetProperty("Name").EnumerateArray().Select(error => error.GetString() ?? string.Empty).ToArray();
        Assert.Equal(["A product family with name 'Misc (Pieces)' already exists in this category."], nameErrors);

        // Step 4: The same name in another category is accepted.
        var acceptedFamily = await api.CreateProductFamilyAsync(secondCategory.EntityId, "Misc (Pieces)", UnitOfMeasure.Piece);
        var familyDetails = await api.GetJsonAsync($"{ApiScenarioClient.ProductFamiliesUri}/{acceptedFamily.EntityId}");
        Assert.Equal(secondCategory.EntityId, familyDetails.GetProperty("categoryId").GetInt32());
        Assert.Equal("Misc (Pieces)", ApiScenarioClient.Name(familyDetails));
    }
}
