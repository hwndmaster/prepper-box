using Genius.Atom.Data.Ef.TestingUtil;
using Genius.PrepperBox.Db.Models;
using Genius.PrepperBox.Db.Repositories;
using Genius.PrepperBox.Dto;
using Genius.PrepperBox.Dto.References;
using Genius.PrepperBox.Dto.RequestMessages;

namespace Genius.PrepperBox.Db.Tests;

public sealed class ProductFamiliesRepositoryTests : BaseRepositoryTests<int, ProductFamilyRef, ProductFamilyDto,
    CreateProductFamilyRequest, UpdateProductFamilyRequest, IProductFamiliesRepository, PrepperBoxDbContext>
{
    [Fact]
    public async Task FindByNameAsync_ReturnsFamilyForNameWithinCategory()
    {
        // Arrange
        await Repository.CreateAsync(CreateSampleCreateDto(0), cancellationToken: TestContext.Current.CancellationToken);

        // Act
        var result = await Repository.FindByNameAsync(new CategoryRef(1), "Sample Family 0", cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Sample Family 0", result.Name);
        Assert.Equal(new CategoryRef(1), result.CategoryId);
    }

    [Fact]
    public async Task FindByNameAsync_WhenNameExistsInDifferentCategory_ReturnsNull()
    {
        // Arrange - a family named "Sample Family 0" in category 1
        await Repository.CreateAsync(CreateSampleCreateDto(0), cancellationToken: TestContext.Current.CancellationToken);

        // Act - look it up under a different category
        var result = await Repository.FindByNameAsync(new CategoryRef(2), "Sample Family 0", cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        Assert.Null(result);
    }

    protected override IProductFamiliesRepository CreateRepository(IDatabaseContext databaseContext)
        => new ProductFamiliesRepository(FakeDateTime, databaseContext);

    protected override CreateProductFamilyRequest CreateSampleCreateDto(int index = 0)
        => new(
            CategoryId: new CategoryRef(1),
            Name: $"Sample Family {index}",
            UnitOfMeasure: UnitOfMeasure.Piece,
            MinimumStockLevel: index);

    protected override UpdateProductFamilyRequest CreateSampleUpdateDto(int id, DateTimeOffset lastModified, int index = 0)
        => new(
            Id: id,
            LastModified: lastModified,
            CategoryId: new CategoryRef(1),
            Name: $"Updated Family {index}",
            UnitOfMeasure: UnitOfMeasure.Can,
            MinimumStockLevel: index);
}
