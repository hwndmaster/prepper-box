using Genius.PrepperBox.Db.Models;

namespace Genius.PrepperBox.Db;

internal static class PrepperBoxDbInitializer
{
    internal const int CategoryFoodId = 1;
    internal const int CategoryWaterId = 2;
    internal const int CategoryMedicalSuppliesId = 3;
    internal const int CategoryCookingId = 4;
    internal const int CategoryCooperId = 5;
    internal const int CategoryOtherId = 6;

    internal const int StorageLocationBarnId = 1;
    internal const int StorageLocationGarderobeId = 2;
    internal const int StorageLocationAtticId = 3;
    internal const int StorageLocationHarryPotterRoomId = 4;

    public static async Task SeedAsync(PrepperBoxDbContext context, bool isDevelopment)
    {
        Guard.NotNull(context);

        // Ensure database exists
        await context.Database.EnsureCreatedAsync();

        // Check if data already exists
        if (context.Categories.Any())
        {
            return; // DB has been seeded
        }

        await SeedMandatoryDataAsync(context).ConfigureAwait(false);

        var sampleDataInitializer = new PrepperBoxSampleDataInitializer();
        await sampleDataInitializer.SeedSampleDataAsync(context, isDevelopment).ConfigureAwait(false);
    }

    private static async Task SeedMandatoryDataAsync(PrepperBoxDbContext context)
    {
        await context.Categories.AddRangeAsync(
            new Category { Id = CategoryFoodId, Name = "Food", IconName = "food" },
            new Category { Id = CategoryWaterId, Name = "Water", IconName = "water" },
            new Category { Id = CategoryMedicalSuppliesId, Name = "Medical Supplies", IconName = "medical" },
            new Category { Id = CategoryCookingId, Name = "Cooking", IconName = "cooking" },
            new Category { Id = CategoryCooperId, Name = "Cooper", IconName = "cooper" },
            new Category { Id = CategoryOtherId, Name = "Other", IconName = "other" }
        );

        await context.StorageLocations.AddRangeAsync(
            new StorageLocation { Id = StorageLocationBarnId, Name = "Barn" },
            new StorageLocation { Id = StorageLocationGarderobeId, Name = "Garderobe" },
            new StorageLocation { Id = StorageLocationAtticId, Name = "Attic" },
            new StorageLocation { Id = StorageLocationHarryPotterRoomId, Name = "Harry Potter room" }
        );

        await context.SaveChangesAsync();
    }
}
