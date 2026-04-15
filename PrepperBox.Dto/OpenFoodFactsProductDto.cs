using Genius.PrepperBox.Db.Models;

namespace Genius.PrepperBox.Dto;

public sealed record OpenFoodFactsProductDto(
    string Code,
    string? ProductName,
    string? Brands,
    string? Categories,
    decimal? Quantity,
    UnitOfMeasure? UnitOfMeasure,
    string? ImageUrl,
    string? ImageSmallUrl
);
