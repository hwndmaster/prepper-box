using System.Linq.Expressions;
using Genius.PrepperBox.Db.Models;
using Genius.PrepperBox.Dto;
using Genius.PrepperBox.Dto.References;
using Genius.PrepperBox.Dto.RequestMessages;
using Microsoft.EntityFrameworkCore;

namespace Genius.PrepperBox.Db.Repositories;

public interface IProductFamiliesRepository : IRepository<int, ProductFamilyRef, ProductFamilyDto, CreateProductFamilyRequest, UpdateProductFamilyRequest>
{
    Task<ProductFamilyDto?> FindByNameAsync(CategoryRef categoryId, string name, CancellationToken cancellationToken = default);
}

internal sealed class ProductFamiliesRepository : BaseRepository<ProductFamily, int, ProductFamilyRef, ProductFamilyDto, CreateProductFamilyRequest, UpdateProductFamilyRequest>, IProductFamiliesRepository
{
    public ProductFamiliesRepository(IDateTime dateTime, IDatabaseContext databaseContext)
        : base(dateTime, databaseContext)
    {
    }

    public async Task<ProductFamilyDto?> FindByNameAsync(CategoryRef categoryId, string name, CancellationToken cancellationToken = default)
    {
        // Use Contains on a single-element array so EF translates the value-converted
        // reference FK to a SQL IN clause (the record '==' operator does not translate).
        var categoryIds = new[] { categoryId };
        return await GetContext().Set<ProductFamily>()
            .AsNoTracking()
            .Where(f => f.Name == name && categoryIds.Contains(f.CategoryId))
            .Select(GetProjectionToGetDto())
            .FirstOrDefaultAsync(cancellationToken).ConfigureAwait(false);
    }

    protected override Expression<Func<ProductFamily, ProductFamilyDto>> ProjectToGetDto { get; }
        = f => new ProductFamilyDto(f.Id, f.CategoryId, f.Name, f.UnitOfMeasure, f.MinimumStockLevel, f.Products.Count, f.DateCreated, f.LastModified);

    protected override ProductFamily MapCreateDto(CreateProductFamilyRequest dto) => new(
        dto.CategoryId,
        dto.Name,
        dto.UnitOfMeasure,
        dto.MinimumStockLevel);

    protected override ProductFamily MapUpdateDto(UpdateProductFamilyRequest dto, ProductFamily existingEntity) =>
        existingEntity with
        {
            CategoryId = dto.CategoryId,
            Name = dto.Name,
            UnitOfMeasure = dto.UnitOfMeasure,
            MinimumStockLevel = dto.MinimumStockLevel
        };
}
