namespace Genius.PrepperBox.Dto;

public sealed record ImageSearchResultDto(
    string ImageUrl,
    string ThumbnailUrl,
    string? Title,
    string? SourcePageUrl,
    string? SourceName,
    int? Width,
    int? Height
);
