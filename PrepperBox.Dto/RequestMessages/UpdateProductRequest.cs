using Genius.PrepperBox.Db.Models;
using Genius.PrepperBox.Dto.References;

namespace Genius.PrepperBox.Dto.RequestMessages;

public sealed record UpdateProductRequest(
    ProductRef Id,
    DateTimeOffset LastModified,
    string Name,
    string? Description,
    CategoryRef CategoryId,
    string? Manufacturer,
    string? BarCode,
    UnitOfMeasure UnitOfMeasure,
    int MinimumStockLevel
) : IPrimaryInt32Id<ProductRef>, ITimeStamped;
