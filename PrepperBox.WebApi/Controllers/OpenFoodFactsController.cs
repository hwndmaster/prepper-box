using Genius.Atom.Web.Controllers;
using Genius.PrepperBox.Core.Services.OpenFoodFacts;
using Genius.PrepperBox.Dto;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace Genius.PrepperBox.WebApi.Controllers;

public sealed class OpenFoodFactsController : BaseController
{
    private readonly IOpenFoodFactsClient _openFoodFactsClient;

    public OpenFoodFactsController(IOpenFoodFactsClient openFoodFactsClient)
    {
        _openFoodFactsClient = openFoodFactsClient;
    }

    [HttpGet("by-barcode/{barCode}", Name = "SearchByBarCode")]
    public async Task<Results<Ok<OpenFoodFactsProductDto[]>, ProblemHttpResult>> GetByBarCode(
        [FromRoute] string barCode,
        CancellationToken cancellationToken)
    {
        OpenFoodFactsProduct? product;

        try
        {
            product = await _openFoodFactsClient.SearchProductsByBarCodeAsync(barCode, cancellationToken).ConfigureAwait(false);
        }
        catch (HttpRequestException ex)
        {
            return TypedResults.Problem(
                "An error occurred while fetching product information.",
                statusCode: (int)(ex.StatusCode ?? System.Net.HttpStatusCode.InternalServerError));
        }

        if (product is null)
        {
            return TypedResults.Ok(Array.Empty<OpenFoodFactsProductDto>());
        }

        var quantity = _openFoodFactsClient.ExtractQuantity(product.Quantity);

        return TypedResults.Ok(new[]
        {
            new OpenFoodFactsProductDto(
                Code: product.Code,
                ProductName: product.ProductName,
                Brands: product.Brands,
                Quantity: quantity?.Quantity,
                UnitOfMeasure: quantity?.UnitOfMeasure,
                ImageUrl: product.ImageUrl,
                ImageSmallUrl: product.ImageSmallUrl)
        });
    }
}
