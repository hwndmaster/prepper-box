using System.ComponentModel.DataAnnotations.Schema;
using Genius.PrepperBox.Dto.References;

namespace Genius.PrepperBox.Db.Models;

public sealed record Product(
    string Name,
    string? Description,
    ProductFamilyRef FamilyId,
    string? Manufacturer,
    string? BarCode,
    string? ImageUrl,
    string? ImageSmallUrl
) : EntityBase<int, ProductRef>
{
    public static Product Create(
        ProductRef id,
        string name,
        ProductFamilyRef familyId,
        string? description = null,
        string? manufacturer = null,
        string? barCode = null,
        string? imageUrl = null,
        string? imageSmallUrl = null)
    {
        return new(name, description, familyId, manufacturer, barCode, imageUrl, imageSmallUrl)
        {
            Id = id
        };
    }

    // Relations:
    [ForeignKey(nameof(FamilyId))]
    public ProductFamily ProductFamily { get; init; } = null!;
    public ICollection<TrackedProduct> TrackedProducts { get; init; } = [];
    public ICollection<ConsumptionLog> ConsumptionLogs { get; init; } = [];
}
