using Genius.PrepperBox.Db.Models;
using Genius.PrepperBox.Dto.References;

namespace Genius.PrepperBox.Dto;

public sealed record ProductDto(
    ProductRef Id,
    string Name,
    string? Description,
    CategoryRef CategoryId,
    string? Manufacturer,
    string? BarCode,
    UnitOfMeasure UnitOfMeasure,
    int MinimumStockLevel,
    decimal TrackedProductsCount,
    DateTimeOffset DateCreated,
    DateTimeOffset LastModified
);
