using System.ComponentModel.DataAnnotations;
using System.Net;
using Genius.Atom.Web.Controllers;
using Genius.PrepperBox.Core.Services.ImageSearch;
using Genius.PrepperBox.Dto;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace Genius.PrepperBox.WebApi.Controllers;

public sealed class ImageSearchController : BaseController
{
    private readonly IImageSearchClient _imageSearchClient;
    private readonly ILogger<ImageSearchController> _logger;

    public ImageSearchController(IImageSearchClient imageSearchClient, ILogger<ImageSearchController> logger)
    {
        _imageSearchClient = imageSearchClient;
        _logger = logger;
    }

    [HttpGet(Name = "SearchImages")]
    public async Task<Results<Ok<ImageSearchResultDto[]>, ProblemHttpResult>> Search(
        [FromQuery, Required] string query,
        CancellationToken cancellationToken)
    {
        if (!_imageSearchClient.IsConfigured)
        {
            return TypedResults.Problem(
                "Image search is not configured. Set ImageSearch:SerpApiKey to a SerpApi API key.",
                statusCode: StatusCodes.Status503ServiceUnavailable);
        }

        IReadOnlyList<ImageSearchResult> images;

        try
        {
            images = await _imageSearchClient.SearchAsync(query, cancellationToken).ConfigureAwait(false);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogWarning(ex, "Image search failed with upstream status {StatusCode}.", ex.StatusCode);

            // SerpApi answers 429 when the hourly throughput or the monthly searches are used up, which the
            // user can act on by waiting. Anything else, an invalid API key (401) included, is a failure of
            // the provider behind this API rather than of the caller's request.
            return ex.StatusCode == HttpStatusCode.TooManyRequests
                ? TypedResults.Problem(
                    "The image search limit has been reached, try again later.",
                    statusCode: StatusCodes.Status429TooManyRequests)
                : TypedResults.Problem(
                    "An error occurred while searching for images.",
                    statusCode: StatusCodes.Status502BadGateway);
        }

        return TypedResults.Ok(images
            .Select(image => new ImageSearchResultDto(
                ImageUrl: image.ImageUrl,
                ThumbnailUrl: image.ThumbnailUrl,
                Title: image.Title,
                SourcePageUrl: image.SourcePageUrl,
                SourceName: image.SourceName,
                Width: image.Width,
                Height: image.Height))
            .ToArray());
    }
}
