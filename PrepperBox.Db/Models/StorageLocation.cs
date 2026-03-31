using Genius.PrepperBox.Dto.References;

namespace Genius.PrepperBox.Db.Models;

public sealed record StorageLocation : EntityBase<int, StorageLocationRef>
{
    public string Name { get; init; }
}
