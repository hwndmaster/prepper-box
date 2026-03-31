using Genius.PrepperBox.Dto.References;

namespace Genius.PrepperBox.Dto;

public sealed record StorageLocationDto(
    StorageLocationRef Id,
    string Name,
    DateTimeOffset DateCreated,
    DateTimeOffset LastModified
);
