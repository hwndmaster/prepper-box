using Genius.PrepperBox.Db.Models;
using Genius.PrepperBox.Db.Repositories;
using Genius.PrepperBox.Dto;
using Genius.PrepperBox.Dto.References;
using Genius.PrepperBox.Dto.RequestMessages;
using Genius.PrepperBox.WebApi.Validators;

namespace Genius.PrepperBox.WebApi.Tests;

public sealed class CreateProductFamilyRequestValidatorTests
{
    private static readonly CategoryRef FoodCategoryId = new(1);
    private static readonly CategoryRef WaterCategoryId = new(2);

    private readonly IProductFamiliesRepository _productFamiliesRepository = A.Fake<IProductFamiliesRepository>();
    private readonly CreateProductFamilyRequestValidator _sut;

    public CreateProductFamilyRequestValidatorTests()
    {
        _sut = new CreateProductFamilyRequestValidator(_productFamiliesRepository);
    }

    [Fact]
    public async Task ValidateAsync_GivenUniqueNameWithinCategory_ReturnsSuccess()
    {
        // Arrange
        var request = new CreateProductFamilyRequest(FoodCategoryId, "Soups", UnitOfMeasure.Can, 5);
        A.CallTo(() => _productFamiliesRepository.FindByNameAsync(FoodCategoryId, "Soups", A<CancellationToken>._))
            .Returns(Task.FromResult<ProductFamilyDto?>(null));

        // Act
        var result = await _sut.ValidateAsync(request, TestContext.Current.CancellationToken);

        // Assert
        Assert.Same(System.ComponentModel.DataAnnotations.ValidationResult.Success, result);
    }

    [Fact]
    public async Task ValidateAsync_WhenNameAlreadyExistsInSameCategory_ReturnsErrorForNameMember()
    {
        // Arrange
        var request = new CreateProductFamilyRequest(FoodCategoryId, "Soups", UnitOfMeasure.Can, 5);
        A.CallTo(() => _productFamiliesRepository.FindByNameAsync(FoodCategoryId, "Soups", A<CancellationToken>._))
            .Returns(Task.FromResult<ProductFamilyDto?>(CreateFamily(FoodCategoryId, "Soups")));

        // Act
        var result = await _sut.ValidateAsync(request, TestContext.Current.CancellationToken);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("A product family with name 'Soups' already exists in this category.", result.ErrorMessage);
        Assert.Equal(["Name"], result.MemberNames);
    }

    [Fact]
    public async Task ValidateAsync_WhenNameExistsOnlyInAnotherCategory_ReturnsSuccess()
    {
        // Arrange - the same family name is taken in the water category, not in the food category
        var request = new CreateProductFamilyRequest(FoodCategoryId, "Misc (Liters)", UnitOfMeasure.Liter, 0);
        A.CallTo(() => _productFamiliesRepository.FindByNameAsync(WaterCategoryId, "Misc (Liters)", A<CancellationToken>._))
            .Returns(Task.FromResult<ProductFamilyDto?>(CreateFamily(WaterCategoryId, "Misc (Liters)")));
        A.CallTo(() => _productFamiliesRepository.FindByNameAsync(FoodCategoryId, "Misc (Liters)", A<CancellationToken>._))
            .Returns(Task.FromResult<ProductFamilyDto?>(null));

        // Act
        var result = await _sut.ValidateAsync(request, TestContext.Current.CancellationToken);

        // Assert
        Assert.Same(System.ComponentModel.DataAnnotations.ValidationResult.Success, result);
    }

    [Fact]
    public async Task ValidateAsync_WhenNameIsEmpty_SkipsUniquenessCheck()
    {
        // Arrange
        var request = new CreateProductFamilyRequest(FoodCategoryId, string.Empty, UnitOfMeasure.Piece, 0);

        // Act
        var result = await _sut.ValidateAsync(request, TestContext.Current.CancellationToken);

        // Assert
        Assert.Same(System.ComponentModel.DataAnnotations.ValidationResult.Success, result);
        A.CallTo(() => _productFamiliesRepository.FindByNameAsync(A<CategoryRef>._, A<string>._, A<CancellationToken>._))
            .MustNotHaveHappened();
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

    private static ProductFamilyDto CreateFamily(CategoryRef categoryId, string name)
        => new(1, categoryId, name, UnitOfMeasure.Can, 0, 0, DateTimeOffset.UnixEpoch, DateTimeOffset.UnixEpoch);
}
