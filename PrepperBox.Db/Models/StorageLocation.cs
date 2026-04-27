using Genius.PrepperBox.Dto.References;

namespace Genius.PrepperBox.Db.Models;

public sealed record StorageLocation(string Name) : EntityBase<int, StorageLocationRef>
{
    public static StorageLocation Create(StorageLocationRef id, string name)
        => new(name)
        {
            Id = id
        };
}
