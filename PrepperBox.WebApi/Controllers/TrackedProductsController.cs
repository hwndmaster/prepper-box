using Genius.Atom.Data.Validation;
using Genius.Atom.Web.Controllers;
using Genius.PrepperBox.Db.Repositories;
using Genius.PrepperBox.Dto;
using Genius.PrepperBox.Dto.References;
using Genius.PrepperBox.Dto.RequestMessages;

namespace Genius.PrepperBox.WebApi.Controllers;

public sealed class TrackedProductsController : BaseCrudController<int, TrackedProductRef, TrackedProductDto, ITrackedProductsRepository, CreateTrackedProductRequest, UpdateTrackedProductRequest>
{
    public TrackedProductsController(ITrackedProductsRepository trackedProductsRepository, IRequestValidators requestValidators)
        : base(trackedProductsRepository, requestValidators)
    {
    }
}
