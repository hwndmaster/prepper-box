using System.ComponentModel.DataAnnotations;
using Genius.Atom.Data.Validation;
using Genius.PrepperBox.Db.Repositories;
using Genius.PrepperBox.Dto.RequestMessages;

namespace Genius.PrepperBox.WebApi.Validators;

public sealed class CreateCategoryRequestValidator : IRequestValidator<CreateCategoryRequest>
{
    private readonly ICategoriesRepository _categoriesRepository;

    public CreateCategoryRequestValidator(ICategoriesRepository categoriesRepository)
    {
        _categoriesRepository = categoriesRepository.NotNull();
    }

    public async Task<ValidationResult?> ValidateAsync(CreateCategoryRequest request, CancellationToken cancellationToken = default)
    {
        if (request is null)
        {
            return new ValidationResult("Request must not be null.");
        }

        if (!string.IsNullOrEmpty(request.Name))
        {
            var existingCategory = await _categoriesRepository.FindByNameAsync(request.Name, cancellationToken);
            if (existingCategory is not null)
            {
                return new ValidationResult($"A category with name '{request.Name}' already exists.", new[] { nameof(request.Name) });
            }
        }

        return ValidationResult.Success;
    }
}
