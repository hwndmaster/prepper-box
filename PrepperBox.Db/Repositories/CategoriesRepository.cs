using System.Linq.Expressions;
using Genius.PrepperBox.Db.Models;
using Genius.PrepperBox.Dto;
using Genius.PrepperBox.Dto.References;
using Genius.PrepperBox.Dto.RequestMessages;
using Microsoft.EntityFrameworkCore;

namespace Genius.PrepperBox.Db.Repositories;

public interface ICategoriesRepository : IRepository<int, CategoryRef, CategoryDto, CreateCategoryRequest, UpdateCategoryRequest>
{
    Task<CategoryDto?> FindByNameAsync(string name, CancellationToken cancellationToken = default);
}

internal sealed class CategoriesRepository : BaseRepository<Category, int, CategoryRef, CategoryDto, CreateCategoryRequest, UpdateCategoryRequest>, ICategoriesRepository
{
    public CategoriesRepository(IDateTime dateTime, IDatabaseContext databaseContext)
        : base(dateTime, databaseContext)
    {
    }

    public async Task<CategoryDto?> FindByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return await GetContext().Set<Category>()
            .Where(c => c.Name == name)
            .Select(ProjectToGetDto())
            .FirstOrDefaultAsync(cancellationToken);
    }

    protected override Expression<Func<Category, CategoryDto>> ProjectToGetDto()
        => b => new CategoryDto(b.Id, b.Name, b.Description, b.IconName, b.DateCreated, b.LastModified);

    protected override Category MapCreateDto(CreateCategoryRequest dto) => new(
        dto.Name,
        dto.Description,
        dto.IconName);

    protected override Category MapUpdateDto(UpdateCategoryRequest dto, Category existingEntity) =>
        existingEntity with
        {
            Name = dto.Name,
            Description = dto.Description,
            IconName = dto.IconName
        };
}
