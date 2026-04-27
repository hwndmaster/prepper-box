using System.Linq.Expressions;
using Genius.PrepperBox.Db.Models;
using Genius.PrepperBox.Dto;
using Genius.PrepperBox.Dto.References;
using Genius.PrepperBox.Dto.RequestMessages;
using Microsoft.EntityFrameworkCore;

namespace Genius.PrepperBox.Db.Repositories;

public interface ITrackedProductsRepository : IRepository<int, TrackedProductRef, TrackedProductDto, CreateTrackedProductRequest, UpdateTrackedProductRequest>
{
}

internal sealed class TrackedProductsRepository : BaseRepository<TrackedProduct, int, TrackedProductRef, TrackedProductDto, CreateTrackedProductRequest, UpdateTrackedProductRequest>, ITrackedProductsRepository
{
    public TrackedProductsRepository(IDateTime dateTime, IDatabaseContext databaseContext)
        : base(dateTime, databaseContext)
    {
    }

    protected override Expression<Func<TrackedProduct, TrackedProductDto>> ProjectToGetDto()
        => b => new TrackedProductDto(b.Id, b.ProductId, b.StorageLocationId, b.ExpirationDate, b.Quantity, b.Notes, b.DateCreated, b.LastModified);

    protected override TrackedProduct MapCreateDto(CreateTrackedProductRequest dto) => new(
        dto.ProductId,
        dto.StorageLocationId,
        dto.ExpirationDate,
        dto.Quantity,
        dto.Notes);

    protected override TrackedProduct MapUpdateDto(UpdateTrackedProductRequest dto, TrackedProduct existingEntity) =>
        existingEntity with
        {
            ProductId = dto.ProductId,
            ExpirationDate = dto.ExpirationDate,
            Quantity = dto.Quantity,
            Notes = dto.Notes
        };
}
