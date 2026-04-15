using System.ComponentModel.DataAnnotations.Schema;
using Genius.PrepperBox.Dto.References;

namespace Genius.PrepperBox.Db.Models;

public sealed record Product : EntityBase<int, ProductRef>
{
    public string Name { get; init; }
    public string? Description { get; init; }
    public CategoryRef CategoryId { get; init; }
    public string? Manufacturer { get; init; }
    public string? BarCode { get; init; }
    public string? ImageUrl { get; init; }
    public string? ImageSmallUrl { get; init; }
    public UnitOfMeasure UnitOfMeasure { get; init; }
    public int MinimumStockLevel { get; init; }

    // Relations:
    [ForeignKey(nameof(CategoryId))]
    public Category Category { get; init; }
    public ICollection<TrackedProduct> TrackedProducts { get; init; }
    public ICollection<ConsumptionLog> ConsumptionLogs { get; init; }
}
