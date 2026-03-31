using Genius.PrepperBox.Dto.References;

namespace Genius.PrepperBox.Dto.RequestMessages;

public sealed record CreateConsumptionLogRequest(
    ProductRef ProductId,
    decimal Quantity,
    string? Reason
);
