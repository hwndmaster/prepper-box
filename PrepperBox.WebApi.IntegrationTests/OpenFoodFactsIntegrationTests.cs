using System.Net;
using Genius.PrepperBox.Db.Models;
using Genius.PrepperBox.WebApi.IntegrationTests.Infrastructure;

namespace Genius.PrepperBox.WebApi.IntegrationTests;

public sealed class OpenFoodFactsIntegrationTests
{
    private const string BarCode = "3017620422003";

    /*
     * Scenario Summary:
     * Validates the OpenFoodFacts bar code lookup pipeline with the external service stubbed out,
     * including the quantity string parsing into a value plus a unit of measure.
     *
     * Steps:
     * 1. Configure a fake OpenFoodFacts product response for the bar code endpoint.
     * 2. Call the OpenFoodFacts API with that bar code.
     * 3. Assert the mapped fields, including the quantity converted from grams to kilograms.
     * 4. Assert the outgoing request hit the expected upstream endpoint.
     */
    [Fact]
    public async Task GetByBarCode_MapsUpstreamProductAndConvertsQuantity()
    {
        // Arrange
        using var factory = new PrepperBoxWebApiFactory();
        factory.OpenFoodFactsHttpMessageHandler.SetJsonResponse($"/api/v2/product/{BarCode}", """
            {
              "status": 1,
              "product": {
                "code": "3017620422003",
                "product_name": "Integration Hazelnut Spread",
                "brands": "Integration Foods",
                "quantity": "400 g (2 x 200 g)",
                "image_url": "https://images.test/front.jpg",
                "image_small_url": "https://images.test/front-small.jpg"
              }
            }
            """);
        using var httpClient = factory.CreateClient();
        var api = new ApiScenarioClient(httpClient);

        // Act
        var result = await api.GetJsonAsync($"{ApiScenarioClient.OpenFoodFactsUri}/by-barcode/{BarCode}");

        // Assert
        var product = Assert.Single(result.EnumerateArray().ToArray());
        Assert.Equal(BarCode, product.GetProperty("code").GetString());
        Assert.Equal("Integration Hazelnut Spread", product.GetProperty("productName").GetString());
        Assert.Equal("Integration Foods", product.GetProperty("brands").GetString());
        Assert.Equal(0.4m, product.GetProperty("quantity").GetDecimal());
        Assert.Equal((int)UnitOfMeasure.Kilogram, product.GetProperty("unitOfMeasure").GetInt32());
        Assert.Equal("https://images.test/front.jpg", product.GetProperty("imageUrl").GetString());
        Assert.Equal("https://images.test/front-small.jpg", product.GetProperty("imageSmallUrl").GetString());

        var request = Assert.Single(factory.OpenFoodFactsHttpMessageHandler.Requests);
        Assert.Equal($"/api/v2/product/{BarCode}", request.AbsolutePath);
    }

    /*
     * Scenario Summary:
     * An upstream response reporting that the product is unknown must surface as an empty result set.
     *
     * Steps:
     * 1. Configure the fake upstream to report status 0 (product not found).
     * 2. Call the OpenFoodFacts API.
     * 3. Assert an empty array is returned.
     */
    [Fact]
    public async Task GetByBarCode_WhenUpstreamReportsUnknownProduct_ReturnsEmptyResult()
    {
        // Arrange
        using var factory = new PrepperBoxWebApiFactory();
        factory.OpenFoodFactsHttpMessageHandler.SetJsonResponse($"/api/v2/product/{BarCode}", """
            { "status": 0, "product": null }
            """);
        using var httpClient = factory.CreateClient();
        var api = new ApiScenarioClient(httpClient);

        // Act
        var result = await api.GetJsonAsync($"{ApiScenarioClient.OpenFoodFactsUri}/by-barcode/{BarCode}");

        // Assert
        Assert.Empty(result.EnumerateArray());
        Assert.Single(factory.OpenFoodFactsHttpMessageHandler.Requests);
    }

    /*
     * Scenario Summary:
     * An upstream failure must be translated into a problem response carrying the upstream status code.
     *
     * Steps:
     * 1. Configure the fake upstream to fail with 503 Service Unavailable.
     * 2. Call the OpenFoodFacts API.
     * 3. Assert the API answers with a problem response using the same status code.
     */
    [Fact]
    public async Task GetByBarCode_WhenUpstreamFails_ReturnsProblemWithUpstreamStatusCode()
    {
        // Arrange
        using var factory = new PrepperBoxWebApiFactory();
        factory.OpenFoodFactsHttpMessageHandler.SetFallbackStatusCode(HttpStatusCode.ServiceUnavailable);
        using var httpClient = factory.CreateClient();
        var api = new ApiScenarioClient(httpClient);

        // Act
        var response = await api.GetAsync($"{ApiScenarioClient.OpenFoodFactsUri}/by-barcode/{BarCode}");

        // Assert
        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        var problem = await ApiScenarioClient.ReadJsonAsync(response);
        Assert.Equal("An error occurred while fetching product information.", problem.GetProperty("detail").GetString());
    }
}
