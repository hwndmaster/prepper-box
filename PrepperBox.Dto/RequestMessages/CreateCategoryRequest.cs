namespace Genius.PrepperBox.Dto.RequestMessages;

public sealed record CreateCategoryRequest(
    string Name,
    string? Description,
    string IconName
);
