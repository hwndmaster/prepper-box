using Genius.Atom.Data.Ef.TestingUtil;
using Genius.PrepperBox.Db.Repositories;
using Genius.PrepperBox.Dto;
using Genius.PrepperBox.Dto.References;
using Genius.PrepperBox.Dto.RequestMessages;

namespace Genius.PrepperBox.Db.Tests;

public sealed class CategoriesRepositoryTests : BaseRepositoryTests<int, CategoryRef, CategoryDto, CreateCategoryRequest, UpdateCategoryRequest, ICategoriesRepository, PrepperBoxDbContext>
{
    [Fact]
    public async Task GetByNameAsync_ReturnsCategoryForName()
    {
        // Arrange
        await Repository.CreateAsync(CreateSampleCreateDto(), cancellationToken: TestContext.Current.CancellationToken);

        // Act
        var result = await Repository.FindByNameAsync("Sample Category 0", cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Sample Category 0", result.Name);
    }

    protected override ICategoriesRepository CreateRepository(IDatabaseContext databaseContext)
        => new CategoriesRepository(FakeDateTime, databaseContext);

    protected override CreateCategoryRequest CreateSampleCreateDto(int index = 0)
        => new(
            Name: $"Sample Category {index}",
            Description: $"Sample Description {index}",
            IconName: $"sample-icon-{index}");

    protected override UpdateCategoryRequest CreateSampleUpdateDto(int id, DateTimeOffset lastModified, int index = 0)
        => new(
            Id: id,
            LastModified: lastModified,
            Name: $"Updated Category {index}",
            Description: $"Updated Description {index}",
            IconName: $"updated-icon-{index}");
}
