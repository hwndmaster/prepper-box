using Genius.Atom.Data.Validation;
using Genius.Atom.Web.Controllers;
using Genius.PrepperBox.Db.Repositories;
using Genius.PrepperBox.Dto;
using Genius.PrepperBox.Dto.References;
using Genius.PrepperBox.Dto.RequestMessages;

namespace Genius.PrepperBox.WebApi.Controllers;

public sealed class StorageLocationsController : BaseCrudController<int, StorageLocationRef, StorageLocationDto, IStorageLocationsRepository, CreateStorageLocationRequest, UpdateStorageLocationRequest>
{
    public StorageLocationsController(IStorageLocationsRepository storageLocationsRepository, IRequestValidators requestValidators)
        : base(storageLocationsRepository, requestValidators)
    {
    }
}
