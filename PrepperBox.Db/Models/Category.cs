using Genius.PrepperBox.Dto.References;

namespace Genius.PrepperBox.Db.Models;

public sealed record Category(
    string Name,
    string? Description,
    string IconName
) : EntityBase<int, CategoryRef>
{
    public static Category Create(CategoryRef id, string name, string iconName, string? description = null)
        => new(name, description, iconName)
        {
            Id = id
        };

    // Relations:
    public ICollection<Product> Products { get; init; } = [];
}
