using System.ComponentModel.DataAnnotations;
using Genius.Atom.Data.Validation;
using Genius.PrepperBox.Db.Repositories;
using Genius.PrepperBox.Dto.RequestMessages;

namespace Genius.PrepperBox.WebApi.Validators;

public sealed class CreateProductFamilyRequestValidator : IRequestValidator<CreateProductFamilyRequest>
{
    private readonly IProductFamiliesRepository _productFamiliesRepository;

    public CreateProductFamilyRequestValidator(IProductFamiliesRepository productFamiliesRepository)
    {
        _productFamiliesRepository = productFamiliesRepository.NotNull();
    }

    public async Task<ValidationResult?> ValidateAsync(CreateProductFamilyRequest request, CancellationToken cancellationToken = default)
    {
        if (request is null)
        {
            return new ValidationResult("Request must not be null.");
        }

        if (!string.IsNullOrEmpty(request.Name))
        {
            var existing = await _productFamiliesRepository.FindByNameAsync(request.CategoryId, request.Name, cancellationToken);
            if (existing is not null)
            {
                return new ValidationResult(
                    $"A product family with name '{request.Name}' already exists in this category.",
                    new[] { nameof(request.Name) });
            }
        }

        return ValidationResult.Success;
    }
}
