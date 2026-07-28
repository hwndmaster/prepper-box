using Genius.Atom.Data.Ef.TestingUtil;
using Genius.PrepperBox.Db.Repositories;
using Genius.PrepperBox.Dto;
using Genius.PrepperBox.Dto.References;
using Genius.PrepperBox.Dto.RequestMessages;

namespace Genius.PrepperBox.Db.Tests;

public sealed class StorageLocationsRepositoryTests : BaseRepositoryTests<int, StorageLocationRef, StorageLocationDto,
    CreateStorageLocationRequest, UpdateStorageLocationRequest, IStorageLocationsRepository, PrepperBoxDbContext>
{
    [Fact]
    public async Task FindByNameAsync_ReturnsStorageLocationForName()
    {
        // Arrange
        var created = await Repository.CreateAsync(CreateSampleCreateDto(), cancellationToken: TestContext.Current.CancellationToken);

        // Act
        var result = await Repository.FindByNameAsync("Sample Storage Location 0", cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(created.EntityId, result.Id);
        Assert.Equal("Sample Storage Location 0", result.Name);
    }

    [Fact]
    public async Task FindByNameAsync_WhenNameDoesNotExist_ReturnsNull()
    {
        // Arrange
        await Repository.CreateAsync(CreateSampleCreateDto(), cancellationToken: TestContext.Current.CancellationToken);

        // Act
        var result = await Repository.FindByNameAsync("Unknown Storage Location", cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        Assert.Null(result);
    }

    protected override IStorageLocationsRepository CreateRepository(IDatabaseContext databaseContext)
        => new StorageLocationsRepository(FakeDateTime, databaseContext);

    protected override CreateStorageLocationRequest CreateSampleCreateDto(int index = 0)
        => new(Name: $"Sample Storage Location {index}");

    protected override UpdateStorageLocationRequest CreateSampleUpdateDto(int id, DateTimeOffset lastModified, int index = 0)
        => new(
            Id: id,
            LastModified: lastModified,
            Name: $"Updated Storage Location {index}");
}
