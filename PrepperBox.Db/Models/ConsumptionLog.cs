using System.ComponentModel.DataAnnotations.Schema;
using Genius.PrepperBox.Dto.References;

namespace Genius.PrepperBox.Db.Models;

public sealed record ConsumptionLog(
    ProductRef ProductId,
    decimal Quantity,
    string? Reason) : EntityBase<int, ConsumptionLogRef>
{
    // Relations:
    [ForeignKey(nameof(ProductId))]
    public Product Product { get; init; } = null!;
}
