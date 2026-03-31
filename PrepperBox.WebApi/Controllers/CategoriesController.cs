using Genius.Atom.Data.Validation;
using Genius.Atom.Web.Controllers;
using Genius.PrepperBox.Db.Repositories;
using Genius.PrepperBox.Dto;
using Genius.PrepperBox.Dto.References;
using Genius.PrepperBox.Dto.RequestMessages;

namespace Genius.PrepperBox.WebApi.Controllers;

public sealed class CategoriesController : BaseCrudController<int, CategoryRef, CategoryDto, ICategoriesRepository, CreateCategoryRequest, UpdateCategoryRequest>
{
    public CategoriesController(ICategoriesRepository categoriesRepository, IRequestValidators requestValidators)
        : base(categoriesRepository, requestValidators)
    {
    }
}
