using System.Linq.Expressions;
using Genius.PrepperBox.Db.Models;
using Genius.PrepperBox.Dto;
using Genius.PrepperBox.Dto.References;
using Genius.PrepperBox.Dto.RequestMessages;
using Microsoft.EntityFrameworkCore;

namespace Genius.PrepperBox.Db.Repositories;

public interface IProductsRepository : IRepository<int, ProductRef, ProductDto, CreateProductRequest, UpdateProductRequest>
{
    Task<IEnumerable<ProductDto>> GetByBarCodeAsync(string barCode, CancellationToken cancellationToken = default);
}

internal sealed class ProductsRepository : BaseRepository<Product, int, ProductRef, ProductDto, CreateProductRequest, UpdateProductRequest>, IProductsRepository
{
    public ProductsRepository(IDateTime dateTime, IDbContextProvider dbContextProvider)
        : base(dateTime, dbContextProvider)
    {
    }

    public async Task<IEnumerable<ProductDto>> GetByBarCodeAsync(string barCode, CancellationToken cancellationToken = default)
    {
        await using var context = WithDbContext();
        return await context.Set<Product>()
            .Where(p => p.BarCode == barCode)
            .Select(ProjectToGetDto())
            .ToArrayAsync(cancellationToken).ConfigureAwait(false);
    }

    protected override Expression<Func<Product, ProductDto>> ProjectToGetDto()
        => b => new ProductDto(b.Id, b.Name, b.Description, b.CategoryId, b.Manufacturer, b.BarCode, b.UnitOfMeasure, b.MinimumStockLevel, b.TrackedProducts.Sum(tp => tp.Quantity), b.DateCreated, b.LastModified);

    protected override Product MapCreateDto(CreateProductRequest dto, DbContext dbContext) => new()
    {
        Name = dto.Name,
        Description = dto.Description,
        CategoryId = dto.CategoryId,
        Manufacturer = dto.Manufacturer,
        BarCode = dto.BarCode,
        UnitOfMeasure = dto.UnitOfMeasure,
        MinimumStockLevel = dto.MinimumStockLevel
    };

    protected override Product MapUpdateDto(UpdateProductRequest dto, Product existingEntity, DbContext dbContext) =>
        existingEntity with
        {
            Name = dto.Name,
            Description = dto.Description,
            CategoryId = dto.CategoryId,
            Manufacturer = dto.Manufacturer,
            BarCode = dto.BarCode,
            UnitOfMeasure = dto.UnitOfMeasure,
            MinimumStockLevel = dto.MinimumStockLevel
        };
}
