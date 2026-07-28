using Genius.Atom.Data.Ef.TestingUtil;
using Genius.PrepperBox.Db.Repositories;
using Genius.PrepperBox.Dto;
using Genius.PrepperBox.Dto.References;
using Genius.PrepperBox.Dto.RequestMessages;

namespace Genius.PrepperBox.Db.Tests;

public sealed class ConsumptionLogsRepositoryTests : BaseRepositoryTests<int, ConsumptionLogRef, ConsumptionLogDto,
    CreateConsumptionLogRequest, UpdateConsumptionLogRequest, IConsumptionLogsRepository, PrepperBoxDbContext>
{
    [Fact]
    public async Task CreateAsync_PersistsConsumedProductQuantityAndReason()
    {
        // Arrange
        var created = await Repository.CreateAsync(CreateSampleCreateDto(2), cancellationToken: TestContext.Current.CancellationToken);

        // Act
        var result = await Repository.GetByIdAsync(created.EntityId, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(new ProductRef(1), result.ProductId);
        Assert.Equal(2m, result.Quantity);
        Assert.Equal("Sample Reason 2", result.Reason);
    }

    [Fact]
    public async Task UpdateAsync_CorrectsConsumedQuantityAndDropsReason()
    {
        // Arrange
        var created = await Repository.CreateAsync(CreateSampleCreateDto(2), cancellationToken: TestContext.Current.CancellationToken);
        var updateRequest = CreateSampleUpdateDto(created.EntityId.Id, created.LastModified, 2) with
        {
            Quantity = 5m,
            Reason = null
        };

        // Act
        await Repository.UpdateAsync(updateRequest, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        var result = await Repository.GetByIdAsync(created.EntityId, cancellationToken: TestContext.Current.CancellationToken);
        Assert.NotNull(result);
        Assert.Equal(5m, result.Quantity);
        Assert.Null(result.Reason);
    }

    protected override IConsumptionLogsRepository CreateRepository(IDatabaseContext databaseContext)
        => new ConsumptionLogsRepository(FakeDateTime, databaseContext);

    protected override CreateConsumptionLogRequest CreateSampleCreateDto(int index = 0)
        => new(
            ProductId: new ProductRef(1),
            Quantity: index,
            Reason: $"Sample Reason {index}");

    protected override UpdateConsumptionLogRequest CreateSampleUpdateDto(int id, DateTimeOffset lastModified, int index = 0)
        => new(
            Id: id,
            LastModified: lastModified,
            ProductId: new ProductRef(2),
            Quantity: index + 1,
            Reason: $"Updated Reason {index}");
}
