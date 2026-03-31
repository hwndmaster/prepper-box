using Genius.Atom.Data.Validation;
using Genius.Atom.Web.Controllers;
using Genius.PrepperBox.Db.Repositories;
using Genius.PrepperBox.Dto;
using Genius.PrepperBox.Dto.References;
using Genius.PrepperBox.Dto.RequestMessages;
using Microsoft.AspNetCore.Mvc;

namespace Genius.PrepperBox.WebApi.Controllers;

public sealed class ProductsController : BaseCrudController<int, ProductRef, ProductDto, IProductsRepository, CreateProductRequest, UpdateProductRequest>
{
    public ProductsController(IProductsRepository productsRepository, IRequestValidators requestValidators)
        : base(productsRepository, requestValidators)
    {
    }

    [HttpGet("by-barcode/{barCode}")]
    public async Task<IEnumerable<ProductDto>> GetByBarCode([FromRoute] string barCode, CancellationToken cancellationToken)
    {
        return await Repository.GetByBarCodeAsync(barCode, cancellationToken).ConfigureAwait(false);
    }
}
