using Genius.PrepperBox.Dto.References;

namespace Genius.PrepperBox.Dto.RequestMessages;

public sealed record UpdateProductRequest(
    ProductRef Id,
    DateTimeOffset LastModified,
    string Name,
    string? Description,
    ProductFamilyRef FamilyId,
    string? Manufacturer,
    string? BarCode,
    string? ImageUrl,
    string? ImageSmallUrl
) : IPrimaryInt32Id<ProductRef>, ITimeStamped;
