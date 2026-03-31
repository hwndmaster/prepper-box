using Genius.PrepperBox.Dto.References;

namespace Genius.PrepperBox.Dto;

public sealed record ConsumptionLogDto(
    ConsumptionLogRef Id,
    ProductRef ProductId,
    decimal Quantity,
    string? Reason,
    DateTimeOffset DateCreated,
    DateTimeOffset LastModified
);
