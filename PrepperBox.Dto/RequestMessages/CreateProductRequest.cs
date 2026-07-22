using Genius.PrepperBox.Dto.References;

namespace Genius.PrepperBox.Dto.RequestMessages;

public sealed record CreateProductRequest(
    string Name,
    string? Description,
    ProductFamilyRef FamilyId,
    string? Manufacturer,
    string? BarCode,
    string? ImageUrl,
    string? ImageSmallUrl
);
