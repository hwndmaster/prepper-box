using Genius.PrepperBox.Dto.References;

namespace Genius.PrepperBox.Dto.RequestMessages;

public sealed record CreateProductRequest(
    string Name,
    string? Description,
    CategoryRef CategoryId,
    string? Manufacturer,
    string? BarCode
);
