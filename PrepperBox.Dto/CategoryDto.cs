using Genius.PrepperBox.Dto.References;

namespace Genius.PrepperBox.Dto;

public sealed record CategoryDto(
    CategoryRef Id,
    string Name,
    string? Description,
    string IconName,
    DateTimeOffset DateCreated,
    DateTimeOffset LastModified
);
