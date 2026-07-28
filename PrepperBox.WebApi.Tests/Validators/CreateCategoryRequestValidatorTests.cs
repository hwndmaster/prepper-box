using Genius.PrepperBox.Db.Repositories;
using Genius.PrepperBox.Dto;
using Genius.PrepperBox.Dto.RequestMessages;
using Genius.PrepperBox.WebApi.Validators;

namespace Genius.PrepperBox.WebApi.Tests;

public sealed class CreateCategoryRequestValidatorTests
{
    private readonly ICategoriesRepository _categoriesRepository = A.Fake<ICategoriesRepository>();
    private readonly CreateCategoryRequestValidator _sut;

    public CreateCategoryRequestValidatorTests()
    {
        _sut = new CreateCategoryRequestValidator(_categoriesRepository);
    }

    [Fact]
    public async Task ValidateAsync_GivenUniqueName_ReturnsSuccess()
    {
        // Arrange
        var request = new CreateCategoryRequest("Tools", "Hand tools", "tools");
        A.CallTo(() => _categoriesRepository.FindByNameAsync("Tools", A<CancellationToken>._))
            .Returns(Task.FromResult<CategoryDto?>(null));

        // Act
        var result = await _sut.ValidateAsync(request, TestContext.Current.CancellationToken);

        // Assert
        Assert.Same(System.ComponentModel.DataAnnotations.ValidationResult.Success, result);
    }

    [Fact]
    public async Task ValidateAsync_WhenNameAlreadyExists_ReturnsErrorForNameMember()
    {
        // Arrange
        var request = new CreateCategoryRequest("Food", null, "food");
        A.CallTo(() => _categoriesRepository.FindByNameAsync("Food", A<CancellationToken>._))
            .Returns(Task.FromResult<CategoryDto?>(CreateCategory("Food")));

        // Act
        var result = await _sut.ValidateAsync(request, TestContext.Current.CancellationToken);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("A category with name 'Food' already exists.", result.ErrorMessage);
        Assert.Equal(["Name"], result.MemberNames);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public async Task ValidateAsync_WhenNameIsEmpty_SkipsUniquenessCheck(string? name)
    {
        // Arrange
        var request = new CreateCategoryRequest(name!, null, "other");

        // Act
        var result = await _sut.ValidateAsync(request, TestContext.Current.CancellationToken);

        // Assert
        Assert.Same(System.ComponentModel.DataAnnotations.ValidationResult.Success, result);
        A.CallTo(() => _categoriesRepository.FindByNameAsync(A<string>._, A<CancellationToken>._)).MustNotHaveHappened();
    }

    [Fact]
    public async Task ValidateAsync_WhenRequestIsNull_ReturnsError()
    {
        // Act
        var result = await _sut.ValidateAsync(null!, TestContext.Current.CancellationToken);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Request must not be null.", result.ErrorMessage);
    }

    private static CategoryDto CreateCategory(string name)
        => new(1, name, null, "icon", DateTimeOffset.UnixEpoch, DateTimeOffset.UnixEpoch);
}
