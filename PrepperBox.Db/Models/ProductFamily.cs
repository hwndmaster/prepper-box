using System.ComponentModel.DataAnnotations.Schema;
using Genius.PrepperBox.Dto.References;

namespace Genius.PrepperBox.Db.Models;

public sealed record ProductFamily(
    CategoryRef CategoryId,
    string Name,
    UnitOfMeasure UnitOfMeasure,
    int MinimumStockLevel
) : EntityBase<int, ProductFamilyRef>
{
    public static ProductFamily Create(
        ProductFamilyRef id,
        CategoryRef categoryId,
        string name,
        UnitOfMeasure unitOfMeasure,
        int minimumStockLevel = 0)
    {
        return new(categoryId, name, unitOfMeasure, minimumStockLevel)
        {
            Id = id
        };
    }

    // Relations:
    [ForeignKey(nameof(CategoryId))]
    public Category Category { get; init; } = null!;
    public ICollection<Product> Products { get; init; } = [];
}
