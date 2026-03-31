using System.ComponentModel.DataAnnotations.Schema;
using Genius.PrepperBox.Dto.References;

namespace Genius.PrepperBox.Db.Models;

public sealed record ConsumptionLog : EntityBase<int, ConsumptionLogRef>
{
    public ProductRef ProductId { get; init; }
    public decimal Quantity { get; init; }
    public string? Reason { get; init; }

    // Relations:
    [ForeignKey(nameof(ProductId))]
    public Product Product { get; init; }
}
