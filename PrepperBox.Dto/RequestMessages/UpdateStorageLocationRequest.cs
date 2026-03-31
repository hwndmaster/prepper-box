using Genius.PrepperBox.Dto.References;

namespace Genius.PrepperBox.Dto.RequestMessages;

public sealed record UpdateStorageLocationRequest(
    StorageLocationRef Id,
    DateTimeOffset LastModified,
    string Name
) : IPrimaryInt32Id<StorageLocationRef>, ITimeStamped;
