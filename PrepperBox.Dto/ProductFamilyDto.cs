using Genius.PrepperBox.Db.Models;
using Genius.PrepperBox.Dto.References;

namespace Genius.PrepperBox.Dto;

public sealed record ProductFamilyDto(
    ProductFamilyRef Id,
    CategoryRef CategoryId,
    string Name,
    UnitOfMeasure UnitOfMeasure,
    decimal MinimumStockLevel,
    int ProductsCount,
    DateTimeOffset DateCreated,
    DateTimeOffset LastModified
) : IEntity<int, ProductFamilyRef>;
