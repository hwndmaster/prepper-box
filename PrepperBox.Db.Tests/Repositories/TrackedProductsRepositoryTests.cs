using Genius.Atom.Data.Ef.TestingUtil;
using Genius.PrepperBox.Db.Repositories;
using Genius.PrepperBox.Dto;
using Genius.PrepperBox.Dto.References;
using Genius.PrepperBox.Dto.RequestMessages;

namespace Genius.PrepperBox.Db.Tests;

public sealed class TrackedProductsRepositoryTests : BaseRepositoryTests<int, TrackedProductRef, TrackedProductDto,
    CreateTrackedProductRequest, UpdateTrackedProductRequest, ITrackedProductsRepository, PrepperBoxDbContext>
{
    private static readonly DateTimeOffset SampleExpirationDate = new(2027, 3, 1, 0, 0, 0, TimeSpan.Zero);

    [Fact]
    public async Task CreateAsync_PersistsStockDetails()
    {
        // Arrange
        var created = await Repository.CreateAsync(CreateSampleCreateDto(1), cancellationToken: TestContext.Current.CancellationToken);

        // Act
        var result = await Repository.GetByIdAsync(created.EntityId, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(new ProductRef(1), result.ProductId);
        Assert.Equal(new StorageLocationRef(1), result.StorageLocationId);
        Assert.Equal(SampleExpirationDate, result.ExpirationDate);
        Assert.Equal(1m, result.Quantity);
        Assert.Equal("Sample Notes 1", result.Notes);
    }

    [Fact]
    public async Task UpdateAsync_MovesStockToAnotherStorageLocation()
    {
        // Arrange
        var created = await Repository.CreateAsync(CreateSampleCreateDto(1), cancellationToken: TestContext.Current.CancellationToken);
        var updateRequest = CreateSampleUpdateDto(created.EntityId.Id, created.LastModified, 1) with
        {
            StorageLocationId = new StorageLocationRef(3)
        };

        // Act
        await Repository.UpdateAsync(updateRequest, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        var result = await Repository.GetByIdAsync(created.EntityId, cancellationToken: TestContext.Current.CancellationToken);
        Assert.NotNull(result);
        Assert.Equal(new StorageLocationRef(3), result.StorageLocationId);
    }

    [Fact]
    public async Task UpdateAsync_ConsumesQuantityAndClearsExpirationDate()
    {
        // Arrange
        var created = await Repository.CreateAsync(CreateSampleCreateDto(1), cancellationToken: TestContext.Current.CancellationToken);
        var updateRequest = CreateSampleUpdateDto(created.EntityId.Id, created.LastModified, 1) with
        {
            Quantity = 0m,
            ExpirationDate = null
        };

        // Act
        await Repository.UpdateAsync(updateRequest, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        var result = await Repository.GetByIdAsync(created.EntityId, cancellationToken: TestContext.Current.CancellationToken);
        Assert.NotNull(result);
        Assert.Equal(0m, result.Quantity);
        Assert.Null(result.ExpirationDate);
    }

    protected override ITrackedProductsRepository CreateRepository(IDatabaseContext databaseContext)
        => new TrackedProductsRepository(FakeDateTime, databaseContext);

    protected override CreateTrackedProductRequest CreateSampleCreateDto(int index = 0)
        => new(
            ProductId: new ProductRef(1),
            StorageLocationId: new StorageLocationRef(1),
            ExpirationDate: SampleExpirationDate,
            Quantity: index,
            Notes: $"Sample Notes {index}");

    protected override UpdateTrackedProductRequest CreateSampleUpdateDto(int id, DateTimeOffset lastModified, int index = 0)
        => new(
            Id: id,
            LastModified: lastModified,
            ProductId: new ProductRef(1),
            StorageLocationId: new StorageLocationRef(2),
            ExpirationDate: SampleExpirationDate.AddMonths(1),
            Quantity: index + 1,
            Notes: $"Updated Notes {index}");
}
