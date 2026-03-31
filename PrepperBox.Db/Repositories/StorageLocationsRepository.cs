using System.Linq.Expressions;
using Genius.PrepperBox.Db.Models;
using Genius.PrepperBox.Dto;
using Genius.PrepperBox.Dto.References;
using Genius.PrepperBox.Dto.RequestMessages;
using Microsoft.EntityFrameworkCore;

namespace Genius.PrepperBox.Db.Repositories;

public interface IStorageLocationsRepository : IRepository<int, StorageLocationRef, StorageLocationDto, CreateStorageLocationRequest, UpdateStorageLocationRequest>
{
    Task<StorageLocationDto?> FindByNameAsync(string name, CancellationToken cancellationToken = default);
}

internal sealed class StorageLocationsRepository : BaseRepository<StorageLocation, int, StorageLocationRef, StorageLocationDto, CreateStorageLocationRequest, UpdateStorageLocationRequest>, IStorageLocationsRepository
{
    public StorageLocationsRepository(IDateTime dateTime, IDbContextProvider dbContextProvider)
        : base(dateTime, dbContextProvider)
    {
    }

    public async Task<StorageLocationDto?> FindByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        await using PrepperBoxDbContext dbContext = (PrepperBoxDbContext)WithDbContext();

        return await dbContext.Set<StorageLocation>()
            .Where(c => c.Name == name)
            .Select(ProjectToGetDto())
            .FirstOrDefaultAsync(cancellationToken);
    }

    protected override Expression<Func<StorageLocation, StorageLocationDto>> ProjectToGetDto()
        => b => new StorageLocationDto(b.Id, b.Name, b.DateCreated, b.LastModified);

    protected override StorageLocation MapCreateDto(CreateStorageLocationRequest dto, DbContext dbContext) => new()
    {
        Name = dto.Name,
    };

    protected override StorageLocation MapUpdateDto(UpdateStorageLocationRequest dto, StorageLocation existingEntity, DbContext dbContext) =>
        existingEntity with
        {
            Name = dto.Name,
        };
}
