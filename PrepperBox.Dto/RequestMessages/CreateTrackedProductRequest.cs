using Genius.PrepperBox.Dto.References;

namespace Genius.PrepperBox.Dto.RequestMessages;

public sealed record CreateTrackedProductRequest(
    ProductRef ProductId,
    StorageLocationRef StorageLocationId,
    DateTimeOffset? ExpirationDate,
    int Quantity,
    string? Notes
);
