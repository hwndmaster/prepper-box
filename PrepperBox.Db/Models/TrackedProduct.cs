using System.ComponentModel.DataAnnotations.Schema;
using Genius.PrepperBox.Dto.References;

namespace Genius.PrepperBox.Db.Models;

public sealed record TrackedProduct : EntityBase<int, TrackedProductRef>
{
    public ProductRef ProductId { get; init; }
    public StorageLocationRef StorageLocationId { get; init; }
    public DateTimeOffset? ExpirationDate { get; init; }
    public decimal Quantity { get; init; }
    public string? Notes { get; init; }

    // Relations:
    [ForeignKey(nameof(ProductId))]
    public Product Product { get; init; }

    [ForeignKey(nameof(StorageLocationId))]
    public StorageLocation StorageLocation { get; init; }
}
