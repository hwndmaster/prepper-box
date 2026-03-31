using Genius.PrepperBox.Dto.References;

namespace Genius.PrepperBox.Db.Models;

public sealed record Category : EntityBase<int, CategoryRef>
{
    public string Name { get; init; }
    public string? Description { get; init; }
    public string IconName { get; init; }

    // Relations:
    public ICollection<Product> Products { get; init; }
}
