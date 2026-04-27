using System.ComponentModel.DataAnnotations.Schema;
using Genius.PrepperBox.Dto.References;

namespace Genius.PrepperBox.Db.Models;

public sealed record TrackedProduct(
    ProductRef ProductId,
    StorageLocationRef StorageLocationId,
    DateTimeOffset? ExpirationDate,
    decimal Quantity,
    string? Notes
) : EntityBase<int, TrackedProductRef>
{
    public static TrackedProduct Create(
        ProductRef productId,
        StorageLocationRef storageLocationId,
        DateTimeOffset? expirationDate = null,
        decimal quantity = 0,
        string? notes = null)
    {
        return new(productId, storageLocationId, expirationDate, quantity, notes);
    }

    // Relations:
    [ForeignKey(nameof(ProductId))]
    public Product Product { get; init; } = null!;

    [ForeignKey(nameof(StorageLocationId))]
    public StorageLocation StorageLocation { get; init; } = null!;
}
