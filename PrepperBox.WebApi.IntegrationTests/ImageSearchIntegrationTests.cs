using System.Net;
using Genius.PrepperBox.WebApi.IntegrationTests.Infrastructure;
using Microsoft.AspNetCore.WebUtilities;

namespace Genius.PrepperBox.WebApi.IntegrationTests;

public sealed class ImageSearchIntegrationTests
{
    private const string Query = "Heinz Baked Beans";

    /*
     * Scenario Summary:
     * Validates the image search pipeline with SerpApi stubbed out: upstream images are mapped, and the
     * ones that cannot serve as a product image (no original, plain HTTP, repeated) are left out.
     *
     * Steps:
     * 1. Configure a fake SerpApi response mixing usable and unusable images.
     * 2. Search for images.
     * 3. Assert only the usable images are returned, in upstream order, with their fields mapped.
     * 4. Assert the outgoing request asked the Google Images engine for the query with the configured key.
     */
    [Fact]
    public async Task Search_MapsUpstreamImagesAndSkipsUnusableOnes()
    {
        // Arrange
        using var factory = new PrepperBoxWebApiFactory();
        factory.SerpApiHttpMessageHandler.SetResponse(HttpStatusCode.OK, """
            {
              "search_metadata": { "status": "Success" },
              "images_results": [
                {
                  "position": 1,
                  "thumbnail": "https://serpapi.test/thumbs/1.jpeg",
                  "original": "https://shop.test/beans.jpg",
                  "original_width": 1200,
                  "original_height": 900,
                  "title": "Heinz Baked Beans 415g",
                  "link": "https://shop.test/products/beans",
                  "source": "Shop Test"
                },
                {
                  "position": 2,
                  "thumbnail": "https://serpapi.test/thumbs/2.jpeg",
                  "original": "http://insecure.test/beans.jpg",
                  "title": "Served over plain HTTP"
                },
                {
                  "position": 3,
                  "thumbnail": "https://serpapi.test/thumbs/3.jpeg",
                  "title": "No original image"
                },
                {
                  "position": 4,
                  "thumbnail": "https://serpapi.test/thumbs/4.jpeg",
                  "original": "https://shop.test/beans.jpg",
                  "title": "The first image again"
                },
                {
                  "position": 5,
                  "original": "https://other.test/beans.png",
                  "title": "No thumbnail"
                }
              ]
            }
            """);
        using var httpClient = factory.CreateClient();
        var api = new ApiScenarioClient(httpClient);

        // Act
        var result = await api.GetJsonAsync($"{ApiScenarioClient.ImageSearchUri}?query={Uri.EscapeDataString(Query)}");

        // Assert
        var images = result.EnumerateArray().ToArray();
        Assert.Equal(2, images.Length);

        Assert.Equal("https://shop.test/beans.jpg", images[0].GetProperty("imageUrl").GetString());
        Assert.Equal("https://serpapi.test/thumbs/1.jpeg", images[0].GetProperty("thumbnailUrl").GetString());
        Assert.Equal("Heinz Baked Beans 415g", images[0].GetProperty("title").GetString());
        Assert.Equal("https://shop.test/products/beans", images[0].GetProperty("sourcePageUrl").GetString());
        Assert.Equal("Shop Test", images[0].GetProperty("sourceName").GetString());
        Assert.Equal(1200, images[0].GetProperty("width").GetInt32());
        Assert.Equal(900, images[0].GetProperty("height").GetInt32());

        // Without a thumbnail of its own, the image previews itself.
        Assert.Equal("https://other.test/beans.png", images[1].GetProperty("imageUrl").GetString());
        Assert.Equal("https://other.test/beans.png", images[1].GetProperty("thumbnailUrl").GetString());
        Assert.False(images[1].TryGetProperty("width", out _));
        Assert.False(images[1].TryGetProperty("sourceName", out _));

        var request = Assert.Single(factory.SerpApiHttpMessageHandler.Requests);
        Assert.Equal("/search.json", request.AbsolutePath);
        var parameters = QueryHelpers.ParseQuery(request.Query);
        Assert.Equal("google_images", parameters["engine"]);
        Assert.Equal(Query, parameters["q"]);
        Assert.Equal(PrepperBoxWebApiFactory.TestSerpApiKey, parameters["api_key"]);
    }

    /*
     * Scenario Summary:
     * When Google finds nothing, SerpApi still answers 200, with an error message instead of any images.
     * That must surface as an empty result set rather than a failure.
     *
     * Steps:
     * 1. Configure the fake SerpApi to report that Google returned no results.
     * 2. Search for images.
     * 3. Assert an empty array is returned.
     */
    [Fact]
    public async Task Search_WhenGoogleFindsNothing_ReturnsEmptyResult()
    {
        // Arrange
        using var factory = new PrepperBoxWebApiFactory();
        factory.SerpApiHttpMessageHandler.SetResponse(HttpStatusCode.OK, """
            {
              "search_metadata": { "status": "Success" },
              "error": "Google hasn't returned any results for this query."
            }
            """);
        using var httpClient = factory.CreateClient();
        var api = new ApiScenarioClient(httpClient);

        // Act
        var result = await api.GetJsonAsync($"{ApiScenarioClient.ImageSearchUri}?query={Uri.EscapeDataString(Query)}");

        // Assert
        Assert.Empty(result.EnumerateArray());
        Assert.Single(factory.SerpApiHttpMessageHandler.Requests);
    }

    /*
     * Scenario Summary:
     * SerpApi answers 429 once the hourly throughput or the monthly searches are used up. The API must
     * pass that on as 429, so the user knows to try again later.
     *
     * Steps:
     * 1. Configure the fake SerpApi to report that the account ran out of searches.
     * 2. Search for images.
     * 3. Assert the API answers with a 429 problem response.
     */
    [Fact]
    public async Task Search_WhenSearchesRunOut_ReturnsTooManyRequests()
    {
        // Arrange
        using var factory = new PrepperBoxWebApiFactory();
        factory.SerpApiHttpMessageHandler.SetResponse(HttpStatusCode.TooManyRequests, """
            { "error": "Your account has run out of searches." }
            """);
        using var httpClient = factory.CreateClient();
        var api = new ApiScenarioClient(httpClient);

        // Act
        var response = await api.GetAsync($"{ApiScenarioClient.ImageSearchUri}?query={Uri.EscapeDataString(Query)}");

        // Assert
        Assert.Equal(HttpStatusCode.TooManyRequests, response.StatusCode);
        var problem = await ApiScenarioClient.ReadJsonAsync(response);
        Assert.Equal("The image search limit has been reached, try again later.", problem.GetProperty("detail").GetString());
    }

    /*
     * Scenario Summary:
     * Any other upstream failure, such as SerpApi rejecting the API key, is a failure of the provider
     * behind the API and must surface as 502 rather than leaking the upstream status code.
     *
     * Steps:
     * 1. Configure the fake SerpApi to reject the API key with 401.
     * 2. Search for images.
     * 3. Assert the API answers with a 502 problem response.
     */
    [Fact]
    public async Task Search_WhenUpstreamRejectsApiKey_ReturnsBadGateway()
    {
        // Arrange
        using var factory = new PrepperBoxWebApiFactory();
        factory.SerpApiHttpMessageHandler.SetResponse(HttpStatusCode.Unauthorized, """
            { "error": "Invalid API key. Your API key should be here: https://serpapi.com/manage-api-key" }
            """);
        using var httpClient = factory.CreateClient();
        var api = new ApiScenarioClient(httpClient);

        // Act
        var response = await api.GetAsync($"{ApiScenarioClient.ImageSearchUri}?query={Uri.EscapeDataString(Query)}");

        // Assert
        Assert.Equal(HttpStatusCode.BadGateway, response.StatusCode);
        var problem = await ApiScenarioClient.ReadJsonAsync(response);
        Assert.Equal("An error occurred while searching for images.", problem.GetProperty("detail").GetString());
    }

    /*
     * Scenario Summary:
     * Without a SerpApi key the image search is disabled: the API answers 503 and never calls upstream.
     *
     * Steps:
     * 1. Start the API without a SerpApi key.
     * 2. Search for images.
     * 3. Assert the API answers with a 503 problem response and SerpApi was not called.
     */
    [Fact]
    public async Task Search_WhenNotConfigured_ReturnsServiceUnavailableWithoutCallingUpstream()
    {
        // Arrange
        using var factory = new PrepperBoxWebApiFactory { IsImageSearchConfigured = false };
        using var httpClient = factory.CreateClient();
        var api = new ApiScenarioClient(httpClient);

        // Act
        var response = await api.GetAsync($"{ApiScenarioClient.ImageSearchUri}?query={Uri.EscapeDataString(Query)}");

        // Assert
        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        Assert.Empty(factory.SerpApiHttpMessageHandler.Requests);
    }

    /*
     * Scenario Summary:
     * A blank query is rejected up front, without spending a search on it.
     *
     * Steps:
     * 1. Search for images with a whitespace-only query.
     * 2. Assert the API answers 400 and SerpApi was not called.
     */
    [Fact]
    public async Task Search_WhenQueryIsBlank_ReturnsBadRequestWithoutCallingUpstream()
    {
        // Arrange
        using var factory = new PrepperBoxWebApiFactory();
        using var httpClient = factory.CreateClient();
        var api = new ApiScenarioClient(httpClient);

        // Act
        var response = await api.GetAsync($"{ApiScenarioClient.ImageSearchUri}?query=%20%20");

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Empty(factory.SerpApiHttpMessageHandler.Requests);
    }
}
