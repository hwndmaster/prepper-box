using Genius.Atom.Data.Ef.TestingUtil;
using Genius.PrepperBox.Db.Models;
using Genius.PrepperBox.Db.Repositories;
using Genius.PrepperBox.Dto;
using Genius.PrepperBox.Dto.References;
using Genius.PrepperBox.Dto.RequestMessages;

namespace Genius.PrepperBox.Db.Tests;

public sealed class ProductsRepositoryTests : BaseRepositoryTests<int, ProductRef, ProductDto,
    CreateProductRequest, UpdateProductRequest, IProductsRepository, PrepperBoxDbContext>, IAsyncLifetime
{
    private IDatabaseContext? _databaseContext;

    /// <summary>
    /// The <see cref="ProductDto"/> projection reads the owning family's category, so a product without
    /// an existing product family is not returned at all — every test needs the families to be seeded.
    /// </summary>
    public async ValueTask InitializeAsync()
    {
        _ = Repository; // Forces the repository (and thereby the database context) to be created.
        var databaseContext = _databaseContext ?? throw new InvalidOperationException("Database context was not captured.");

        await databaseContext.Set<ProductFamily>().AddRangeAsync(
            [
                ProductFamily.Create(1, 1, "Sample Family 1", UnitOfMeasure.Piece),
                ProductFamily.Create(2, 1, "Sample Family 2", UnitOfMeasure.Can)
            ],
            TestContext.Current.CancellationToken);
        await databaseContext.SaveChangesAsync(TestContext.Current.CancellationToken);
    }

    public ValueTask DisposeAsync() => ValueTask.CompletedTask;

    [Fact]
    public async Task GetByBarCodeAsync_ReturnsProductsWithMatchingBarCode()
    {
        // Arrange
        var matching = await Repository.CreateAsync(CreateSampleCreateDto(1), cancellationToken: TestContext.Current.CancellationToken);
        await Repository.CreateAsync(CreateSampleCreateDto(2), cancellationToken: TestContext.Current.CancellationToken);

        // Act
        var result = (await Repository.GetByBarCodeAsync("bar-code-1", cancellationToken: TestContext.Current.CancellationToken)).ToArray();

        // Assert
        var product = Assert.Single(result);
        Assert.Equal(matching.EntityId, product.Id);
        Assert.Equal("Sample Product 1", product.Name);
        Assert.Equal("bar-code-1", product.BarCode);
    }

    [Fact]
    public async Task GetByBarCodeAsync_WhenNoProductMatches_ReturnsEmpty()
    {
        // Arrange
        await Repository.CreateAsync(CreateSampleCreateDto(1), cancellationToken: TestContext.Current.CancellationToken);

        // Act
        var result = await Repository.GetByBarCodeAsync("unknown-bar-code", cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        Assert.Empty(result);
    }

    [Fact]
    public async Task UpdateAsync_ChangesProductFamily()
    {
        // Arrange
        var created = await Repository.CreateAsync(CreateSampleCreateDto(1), cancellationToken: TestContext.Current.CancellationToken);
        var updateRequest = CreateSampleUpdateDto(created.EntityId.Id, created.LastModified, 1) with
        {
            FamilyId = new ProductFamilyRef(2)
        };

        // Act
        await Repository.UpdateAsync(updateRequest, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        var result = await Repository.GetByIdAsync(created.EntityId, cancellationToken: TestContext.Current.CancellationToken);
        Assert.NotNull(result);
        Assert.Equal(new ProductFamilyRef(2), result.FamilyId);
        Assert.Equal("Updated Product 1", result.Name);
        Assert.Equal("Updated Manufacturer 1", result.Manufacturer);
    }

    protected override IProductsRepository CreateRepository(IDatabaseContext databaseContext)
    {
        _databaseContext = databaseContext;
        return new ProductsRepository(FakeDateTime, databaseContext);
    }

    protected override CreateProductRequest CreateSampleCreateDto(int index = 0)
        => new(
            Name: $"Sample Product {index}",
            Description: $"Sample Description {index}",
            FamilyId: new ProductFamilyRef(1),
            Manufacturer: $"Sample Manufacturer {index}",
            BarCode: $"bar-code-{index}",
            ImageUrl: $"https://example.test/image-{index}.jpg",
            ImageSmallUrl: $"https://example.test/image-small-{index}.jpg");

    protected override UpdateProductRequest CreateSampleUpdateDto(int id, DateTimeOffset lastModified, int index = 0)
        => new(
            Id: id,
            LastModified: lastModified,
            Name: $"Updated Product {index}",
            Description: $"Updated Description {index}",
            FamilyId: new ProductFamilyRef(1),
            Manufacturer: $"Updated Manufacturer {index}",
            BarCode: $"updated-bar-code-{index}",
            ImageUrl: $"https://example.test/updated-image-{index}.jpg",
            ImageSmallUrl: $"https://example.test/updated-image-small-{index}.jpg");
}
