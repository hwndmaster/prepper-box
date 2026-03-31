using Genius.PrepperBox.Dto.References;

namespace Genius.PrepperBox.Dto;

public sealed record TrackedProductDto(
    TrackedProductRef Id,
    ProductRef ProductId,
    StorageLocationRef StorageLocationId,
    DateTimeOffset? ExpirationDate,
    decimal Quantity,
    string? Notes,
    DateTimeOffset DateCreated,
    DateTimeOffset LastModified
);
