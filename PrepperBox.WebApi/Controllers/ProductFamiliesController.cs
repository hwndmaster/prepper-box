using Genius.Atom.Data.Validation;
using Genius.Atom.Web.Controllers;
using Genius.PrepperBox.Db.Repositories;
using Genius.PrepperBox.Dto;
using Genius.PrepperBox.Dto.References;
using Genius.PrepperBox.Dto.RequestMessages;

namespace Genius.PrepperBox.WebApi.Controllers;

public sealed class ProductFamiliesController : BaseCrudController<int, ProductFamilyRef, ProductFamilyDto, IProductFamiliesRepository, CreateProductFamilyRequest, UpdateProductFamilyRequest>
{
    public ProductFamiliesController(IProductFamiliesRepository productFamiliesRepository, IRequestValidators requestValidators)
        : base(productFamiliesRepository, requestValidators)
    {
    }
}
