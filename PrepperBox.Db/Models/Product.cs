using System.ComponentModel.DataAnnotations.Schema;
using Genius.PrepperBox.Dto.References;

namespace Genius.PrepperBox.Db.Models;

public sealed record Product(
    string Name,
    string? Description,
    CategoryRef CategoryId,
    string? Manufacturer,
    string? BarCode,
    string? ImageUrl,
    string? ImageSmallUrl,
    UnitOfMeasure UnitOfMeasure,
    int MinimumStockLevel
) : EntityBase<int, ProductRef>
{
    public static Product Create(
        ProductRef id,
        string name,
        CategoryRef categoryId,
        string? description = null,
        string? manufacturer = null,
        string? barCode = null,
        string? imageUrl = null,
        string? imageSmallUrl = null,
        UnitOfMeasure unitOfMeasure = UnitOfMeasure.Piece,
        int minimumStockLevel = 0)
    {
        return new(name, description, categoryId, manufacturer, barCode, imageUrl, imageSmallUrl, unitOfMeasure, minimumStockLevel)
        {
            Id = id
        };
    }

    // Relations:
    [ForeignKey(nameof(CategoryId))]
    public Category Category { get; init; } = null!;
    public ICollection<TrackedProduct> TrackedProducts { get; init; } = [];
    public ICollection<ConsumptionLog> ConsumptionLogs { get; init; } = [];
}
