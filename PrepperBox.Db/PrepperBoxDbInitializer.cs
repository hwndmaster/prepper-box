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

    internal static readonly ProductFamilyRef FamilyFoodSoupsId = 1;
    internal static readonly ProductFamilyRef FamilyFoodNoodlesId = 2;
    internal static readonly ProductFamilyRef FamilyFoodCannedFishId = 3;
    internal static readonly ProductFamilyRef FamilyFoodCannedMeatId = 4;
    internal static readonly ProductFamilyRef FamilyFoodCannedVeggiesId = 5;
    internal static readonly ProductFamilyRef FamilyFoodSweetsId = 6;
    internal static readonly ProductFamilyRef FamilyFoodBiscuitsId = 7;
    internal static readonly ProductFamilyRef FamilyFoodMiscPiecesId = 8;
    internal static readonly ProductFamilyRef FamilyFoodMiscByWeightId = 9;
    internal static readonly ProductFamilyRef FamilyFoodMiscCansId = 10;
    internal static readonly ProductFamilyRef FamilyWaterMiscLitersId = 11;
    internal static readonly ProductFamilyRef FamilyMedicalMiscPiecesId = 12;
    internal static readonly ProductFamilyRef FamilyCookingMiscPiecesId = 13;
    internal static readonly ProductFamilyRef FamilyCooperMiscPiecesId = 14;
    internal static readonly ProductFamilyRef FamilyOtherMiscPiecesId = 15;

    internal static readonly StorageLocationRef StorageLocationBarnId = 1;
    internal static readonly StorageLocationRef StorageLocationGarderobeId = 2;
    internal static readonly StorageLocationRef StorageLocationAtticId = 3;
    internal static readonly StorageLocationRef StorageLocationHarryPotterRoomId = 4;

    public static async Task SeedAsync(PrepperBoxDbContext context, bool isDevelopment)
    {
        Guard.NotNull(context);

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

        await context.ProductFamilies.AddRangeAsync(
            ProductFamily.Create(FamilyFoodSoupsId, CategoryFoodId, "Soups", UnitOfMeasure.Can),
            ProductFamily.Create(FamilyFoodNoodlesId, CategoryFoodId, "Noodles", UnitOfMeasure.Piece),
            ProductFamily.Create(FamilyFoodCannedFishId, CategoryFoodId, "Canned fish", UnitOfMeasure.Can),
            ProductFamily.Create(FamilyFoodCannedMeatId, CategoryFoodId, "Canned meat", UnitOfMeasure.Can),
            ProductFamily.Create(FamilyFoodCannedVeggiesId, CategoryFoodId, "Canned veggies", UnitOfMeasure.Can),
            ProductFamily.Create(FamilyFoodSweetsId, CategoryFoodId, "Sweets", UnitOfMeasure.Piece),
            ProductFamily.Create(FamilyFoodBiscuitsId, CategoryFoodId, "Biscuits", UnitOfMeasure.Piece),
            ProductFamily.Create(FamilyFoodMiscPiecesId, CategoryFoodId, "Misc (Pieces)", UnitOfMeasure.Piece),
            ProductFamily.Create(FamilyFoodMiscByWeightId, CategoryFoodId, "Misc (By weight)", UnitOfMeasure.Kilogram),
            ProductFamily.Create(FamilyFoodMiscCansId, CategoryFoodId, "Misc (Cans)", UnitOfMeasure.Can),
            ProductFamily.Create(FamilyWaterMiscLitersId, CategoryWaterId, "Misc (Liters)", UnitOfMeasure.Liter),
            ProductFamily.Create(FamilyMedicalMiscPiecesId, CategoryMedicalSuppliesId, "Misc (Pieces)", UnitOfMeasure.Piece),
            ProductFamily.Create(FamilyCookingMiscPiecesId, CategoryCookingId, "Misc (Pieces)", UnitOfMeasure.Piece),
            ProductFamily.Create(FamilyCooperMiscPiecesId, CategoryCooperId, "Misc (Pieces)", UnitOfMeasure.Piece),
            ProductFamily.Create(FamilyOtherMiscPiecesId, CategoryOtherId, "Misc (Pieces)", UnitOfMeasure.Piece)
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
