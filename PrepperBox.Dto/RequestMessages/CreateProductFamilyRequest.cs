using Genius.PrepperBox.Db.Models;
using Genius.PrepperBox.Dto.References;

namespace Genius.PrepperBox.Dto.RequestMessages;

public sealed record CreateProductFamilyRequest(
    CategoryRef CategoryId,
    string Name,
    UnitOfMeasure UnitOfMeasure,
    int MinimumStockLevel
);
