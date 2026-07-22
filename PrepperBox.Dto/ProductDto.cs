using Genius.PrepperBox.Dto.References;

namespace Genius.PrepperBox.Dto;

public sealed record ProductDto(
    ProductRef Id,
    string Name,
    string? Description,
    ProductFamilyRef FamilyId,
    CategoryRef CategoryId,
    string? Manufacturer,
    string? BarCode,
    string? ImageUrl,
    string? ImageSmallUrl,
    decimal TrackedProductsCount,
    DateTimeOffset DateCreated,
    DateTimeOffset LastModified
);
