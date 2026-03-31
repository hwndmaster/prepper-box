using Genius.PrepperBox.Dto.References;

namespace Genius.PrepperBox.Dto.RequestMessages;

public sealed record UpdateTrackedProductRequest(
    TrackedProductRef Id,
    DateTimeOffset LastModified,
    ProductRef ProductId,
    StorageLocationRef StorageLocationId,
    DateTimeOffset? ExpirationDate,
    int Quantity,
    string? Notes
) : IPrimaryInt32Id<TrackedProductRef>, ITimeStamped;
