using Genius.PrepperBox.Core.Services.OpenFoodFacts;
using Genius.PrepperBox.Dto;
using Microsoft.AspNetCore.Mvc;

namespace Genius.PrepperBox.WebApi.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public sealed class OpenFoodFactsController : ControllerBase
{
    private readonly IOpenFoodFactsClient _openFoodFactsClient;

    public OpenFoodFactsController(IOpenFoodFactsClient openFoodFactsClient)
    {
        _openFoodFactsClient = openFoodFactsClient;
    }

    [HttpGet("by-barcode/{barCode}", Name = "SearchByBarCode")]
    public async Task<ActionResult<IEnumerable<OpenFoodFactsProductDto>>> GetByBarCode(
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
            // Log the exception (not implemented here)
            return StatusCode((int)(ex.StatusCode ?? System.Net.HttpStatusCode.InternalServerError), "An error occurred while fetching product information.");
        }

        if (product is null)
        {
            return Ok(Array.Empty<OpenFoodFactsProductDto>());
        }

        var quantity = _openFoodFactsClient.ExtractQuantity(product.Quantity);

        return Ok(new[]
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
