using Genius.PrepperBox.Dto.References;

namespace Genius.PrepperBox.Dto.RequestMessages;

public sealed record UpdateCategoryRequest(
    CategoryRef Id,
    DateTimeOffset LastModified,
    string Name,
    string? Description,
    string IconName
) : IPrimaryInt32Id<CategoryRef>, ITimeStamped;
