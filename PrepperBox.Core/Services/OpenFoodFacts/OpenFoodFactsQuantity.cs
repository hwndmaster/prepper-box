using Genius.PrepperBox.Db.Models;

namespace Genius.PrepperBox.Core.Services.OpenFoodFacts;

public sealed record OpenFoodFactsQuantity(
    decimal Quantity,
    UnitOfMeasure UnitOfMeasure
);
