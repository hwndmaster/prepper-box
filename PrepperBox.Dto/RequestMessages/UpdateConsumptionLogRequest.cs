using Genius.PrepperBox.Dto.References;

namespace Genius.PrepperBox.Dto.RequestMessages;

public sealed record UpdateConsumptionLogRequest(
    ConsumptionLogRef Id,
    DateTimeOffset LastModified,
    ProductRef ProductId,
    decimal Quantity,
    string? Reason
) : IPrimaryInt32Id<ConsumptionLogRef>, ITimeStamped;
