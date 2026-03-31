using Genius.PrepperBox.Db.Repositories;
using Genius.PrepperBox.Dto;
using Genius.PrepperBox.Dto.References;
using Genius.PrepperBox.Dto.RequestMessages;

namespace Genius.PrepperBox.Db.Tests;

public sealed class CategoriesRepositoryTests : BaseRepositoryTests<int, CategoryRef, CategoryDto, CreateCategoryRequest, UpdateCategoryRequest, ICategoriesRepository>
{
    [Fact]
    public async Task GetByNameAsync_ReturnsCategoryForName()
    {
        // Arrange
        await Repository.CreateAsync(CreateSampleCreateDto(), cancellationToken: TestContext.Current.CancellationToken);

        // Act
        var result = await Repository.FindByNameAsync("Sample Category", cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Sample Category", result.Name);
    }

    protected override ICategoriesRepository CreateRepository(IDbContextProvider dbContextProvider)
        => new CategoriesRepository(FakeDateTime, dbContextProvider);

    protected override CreateCategoryRequest CreateSampleCreateDto()
        => new(
            Name: "Sample Category",
            Description: "Sample Description",
            IconName: "sample-icon");

    protected override UpdateCategoryRequest CreateSampleUpdateDto(int id, DateTimeOffset lastModified)
        => new(
            Id: id,
            LastModified: lastModified,
            Name: "Updated Category",
            Description: "Updated Description",
            IconName: "updated-icon");
}
