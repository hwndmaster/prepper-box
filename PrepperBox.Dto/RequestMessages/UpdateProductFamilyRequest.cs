using Genius.PrepperBox.Db.Models;
using Genius.PrepperBox.Dto.References;

namespace Genius.PrepperBox.Dto.RequestMessages;

public sealed record UpdateProductFamilyRequest(
    ProductFamilyRef Id,
    DateTimeOffset LastModified,
    CategoryRef CategoryId,
    string Name,
    UnitOfMeasure UnitOfMeasure,
    int MinimumStockLevel
) : IPrimaryInt32Id<ProductFamilyRef>, ITimeStamped;
