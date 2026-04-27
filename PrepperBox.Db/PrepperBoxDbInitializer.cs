using Genius.PrepperBox.Db.Models;
using Genius.PrepperBox.Dto.References;

namespace Genius.PrepperBox.Db;

internal static class PrepperBoxDbInitializer
{
    internal static readonly CategoryRef CategoryFoodId = 1;
    internal static readonly CategoryRef CategoryWaterId = 2;
    internal static readonly CategoryRef CategoryMedicalSuppliesId = 3;
    internal static readonly CategoryRef CategoryCookingId = 4;
    internal static readonly CategoryRef CategoryCooperId = 5;
    internal static readonly CategoryRef CategoryOtherId = 6;

    internal static readonly StorageLocationRef StorageLocationBarnId = 1;
    internal static readonly StorageLocationRef StorageLocationGarderobeId = 2;
    internal static readonly StorageLocationRef StorageLocationAtticId = 3;
    internal static readonly StorageLocationRef StorageLocationHarryPotterRoomId = 4;

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
            Category.Create(CategoryFoodId, "Food", "food"),
            Category.Create(CategoryWaterId, "Water", "water"),
            Category.Create(CategoryMedicalSuppliesId, "Medical Supplies", "medical"),
            Category.Create(CategoryCookingId, "Cooking", "cooking"),
            Category.Create(CategoryCooperId, "Cooper", "cooper"),
            Category.Create(CategoryOtherId, "Other", "other")
        );

        await context.StorageLocations.AddRangeAsync(
            StorageLocation.Create(StorageLocationBarnId, "Barn"),
            StorageLocation.Create(StorageLocationGarderobeId, "Garderobe"),
            StorageLocation.Create(StorageLocationAtticId, "Attic"),
            StorageLocation.Create(StorageLocationHarryPotterRoomId, "Harry Potter room")
        );

        await context.SaveChangesAsync();
    }
}
