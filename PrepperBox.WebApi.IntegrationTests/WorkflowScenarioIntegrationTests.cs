using System.Net;
using Genius.PrepperBox.Db.Models;
using Genius.PrepperBox.WebApi.IntegrationTests.Infrastructure;

namespace Genius.PrepperBox.WebApi.IntegrationTests;

public sealed class WorkflowScenarioIntegrationTests
{
    private static readonly DateTimeOffset NearExpiration = new(2028, 5, 1, 12, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset LateExpiration = new(2030, 11, 15, 8, 30, 0, TimeSpan.Zero);

    /*
     * Scenario Summary:
     * End-to-end stock lifecycle: a new category, product family and product are created, stock is
     * added in two batches, moved between storage locations, consumed, and finally removed — checking
     * the aggregated counters and the cascaded cleanup along the way.
     *
     * Steps:
     * 1. Create a category.
     * 2. Create a product family in that category.
     * 3. Create a product in that family and verify the family's product counter.
     * 4. Create two storage locations.
     * 5. Add two stock batches for the product and verify the aggregated stock quantity.
     * 6. Rename the product and give it a new bar code, then look it up by bar code.
     * 7. Move the first batch to the second storage location and consume part of its quantity.
     * 8. Log the consumption and correct it afterwards.
     * 9. Read both batches at once through the by-ids endpoint.
     * 10. Delete the second batch and validate the aggregated stock quantity.
     * 11. Delete the product and validate that its stock and consumption logs are cascaded away.
     * 12. Delete the now-empty product family and category.
     */
    [Fact]
    public async Task StockLifecycleWorkflow_AggregatesQuantitiesAndCascadesOwnedData()
    {
        // Arrange
        using var factory = new PrepperBoxWebApiFactory();
        using var httpClient = factory.CreateClient();
        var api = new ApiScenarioClient(httpClient);

        // Step 1: Create a category.
        var category = await api.CreateCategoryAsync("Integration Supplies", "Created by integration test", "supplies");
        var categoryDetails = await api.GetJsonAsync($"{ApiScenarioClient.CategoriesUri}/{category.EntityId}");
        Assert.Equal("Integration Supplies", ApiScenarioClient.Name(categoryDetails));
        Assert.Equal("Created by integration test", categoryDetails.GetProperty("description").GetString());

        // Step 2: Create a product family in that category.
        var family = await api.CreateProductFamilyAsync(category.EntityId, "Integration Cans", UnitOfMeasure.Can, minimumStockLevel: 4);
        var familyDetails = await api.GetJsonAsync($"{ApiScenarioClient.ProductFamiliesUri}/{family.EntityId}");
        Assert.Equal(category.EntityId, familyDetails.GetProperty("categoryId").GetInt32());
        Assert.Equal((int)UnitOfMeasure.Can, familyDetails.GetProperty("unitOfMeasure").GetInt32());
        Assert.Equal(4, familyDetails.GetProperty("minimumStockLevel").GetInt32());
        Assert.Equal(0, familyDetails.GetProperty("productsCount").GetInt32());

        // Step 3: Create a product in that family and verify the family's product counter.
        var product = await api.CreateProductAsync(
            family.EntityId,
            "Integration Stew",
            description: "Created by integration test",
            manufacturer: "Integration Foods",
            barCode: "1234567890123");
        var productDetails = await api.GetJsonAsync($"{ApiScenarioClient.ProductsUri}/{product.EntityId}");
        Assert.Equal(family.EntityId, productDetails.GetProperty("familyId").GetInt32());
        Assert.Equal(category.EntityId, productDetails.GetProperty("categoryId").GetInt32());
        Assert.Equal(0m, productDetails.GetProperty("trackedProductsCount").GetDecimal());
        familyDetails = await api.GetJsonAsync($"{ApiScenarioClient.ProductFamiliesUri}/{family.EntityId}");
        Assert.Equal(1, familyDetails.GetProperty("productsCount").GetInt32());

        // Step 4: Create two storage locations.
        var pantry = await api.CreateStorageLocationAsync("Integration Pantry");
        var cellar = await api.CreateStorageLocationAsync("Integration Cellar");
        var storageLocations = await api.GetJsonAsync(ApiScenarioClient.StorageLocationsUri);
        Assert.Contains(storageLocations.EnumerateArray(), location => ApiScenarioClient.Id(location) == pantry.EntityId);
        Assert.Contains(storageLocations.EnumerateArray(), location => ApiScenarioClient.Id(location) == cellar.EntityId);

        // Step 5: Add two stock batches for the product and verify the aggregated stock quantity.
        var firstBatch = await api.CreateTrackedProductAsync(
            product.EntityId, pantry.EntityId, quantity: 6, expirationDate: NearExpiration, notes: "First batch");
        var secondBatch = await api.CreateTrackedProductAsync(
            product.EntityId, pantry.EntityId, quantity: 4, expirationDate: LateExpiration);
        productDetails = await api.GetJsonAsync($"{ApiScenarioClient.ProductsUri}/{product.EntityId}");
        Assert.Equal(10m, productDetails.GetProperty("trackedProductsCount").GetDecimal());

        // Step 6: Rename the product and give it a new bar code, then look it up by bar code.
        var updatedProduct = await api.UpdateProductAsync(
            product.EntityId,
            ApiScenarioClient.LastModified(productDetails),
            family.EntityId,
            "Integration Stew Deluxe",
            manufacturer: "Integration Foods",
            barCode: "9876543210987");
        productDetails = await api.GetJsonAsync($"{ApiScenarioClient.ProductsUri}/{product.EntityId}");
        Assert.Equal(updatedProduct.LastModified, ApiScenarioClient.LastModified(productDetails));
        Assert.Equal("Integration Stew Deluxe", ApiScenarioClient.Name(productDetails));
        var byNewBarCode = await api.GetJsonAsync($"{ApiScenarioClient.ProductsUri}/by-barcode/9876543210987");
        Assert.Equal(product.EntityId, ApiScenarioClient.Id(Assert.Single(byNewBarCode.EnumerateArray().ToArray())));
        var byOldBarCode = await api.GetJsonAsync($"{ApiScenarioClient.ProductsUri}/by-barcode/1234567890123");
        Assert.Empty(byOldBarCode.EnumerateArray());

        // Step 7: Move the first batch to the second storage location and consume part of its quantity.
        var movedBatch = await api.UpdateTrackedProductAsync(
            firstBatch.EntityId,
            firstBatch.LastModified,
            product.EntityId,
            cellar.EntityId,
            quantity: 4,
            expirationDate: NearExpiration,
            notes: "Moved to the cellar");
        var batchDetails = await api.GetJsonAsync($"{ApiScenarioClient.TrackedProductsUri}/{firstBatch.EntityId}");
        Assert.Equal(movedBatch.LastModified, ApiScenarioClient.LastModified(batchDetails));
        Assert.Equal(cellar.EntityId, batchDetails.GetProperty("storageLocationId").GetInt32());
        Assert.Equal(4m, batchDetails.GetProperty("quantity").GetDecimal());
        Assert.Equal(ApiScenarioClient.Ticks(NearExpiration), batchDetails.GetProperty("expirationDate").GetInt64());
        Assert.Equal("Moved to the cellar", batchDetails.GetProperty("notes").GetString());
        productDetails = await api.GetJsonAsync($"{ApiScenarioClient.ProductsUri}/{product.EntityId}");
        Assert.Equal(8m, productDetails.GetProperty("trackedProductsCount").GetDecimal());

        // Step 8: Log the consumption and correct it afterwards.
        var consumption = await api.CreateConsumptionLogAsync(product.EntityId, quantity: 2, reason: "Cooked dinner");
        var consumptionLogs = await api.GetJsonAsync(ApiScenarioClient.ConsumptionLogsUri);
        Assert.Equal(product.EntityId, Assert.Single(consumptionLogs.EnumerateArray().ToArray()).GetProperty("productId").GetInt32());
        await api.UpdateConsumptionLogAsync(
            consumption.EntityId, consumption.LastModified, product.EntityId, quantity: 3, reason: "Cooked dinner for guests");
        var consumptionDetails = await api.GetJsonAsync($"{ApiScenarioClient.ConsumptionLogsUri}/{consumption.EntityId}");
        Assert.Equal(3m, consumptionDetails.GetProperty("quantity").GetDecimal());
        Assert.Equal("Cooked dinner for guests", consumptionDetails.GetProperty("reason").GetString());

        // Step 9: Read both batches at once through the by-ids endpoint.
        var batches = await api.GetByIdsAsync(ApiScenarioClient.TrackedProductsUri, firstBatch.EntityId, secondBatch.EntityId);
        Assert.Equal(2, batches.GetArrayLength());
        Assert.Contains(batches.EnumerateArray(), batch => ApiScenarioClient.Id(batch) == firstBatch.EntityId);
        Assert.Contains(batches.EnumerateArray(), batch => ApiScenarioClient.Id(batch) == secondBatch.EntityId);

        // Step 10: Delete the second batch and validate the aggregated stock quantity.
        await api.DeleteAsync($"{ApiScenarioClient.TrackedProductsUri}/{secondBatch.EntityId}");
        Assert.Equal(HttpStatusCode.NotFound, (await api.GetAsync($"{ApiScenarioClient.TrackedProductsUri}/{secondBatch.EntityId}")).StatusCode);
        productDetails = await api.GetJsonAsync($"{ApiScenarioClient.ProductsUri}/{product.EntityId}");
        Assert.Equal(4m, productDetails.GetProperty("trackedProductsCount").GetDecimal());

        // Step 11: Delete the product and validate that its stock and consumption logs are cascaded away.
        await api.DeleteAsync($"{ApiScenarioClient.ProductsUri}/{product.EntityId}");
        Assert.Empty((await api.GetJsonAsync(ApiScenarioClient.ProductsUri)).EnumerateArray());
        Assert.Empty((await api.GetJsonAsync(ApiScenarioClient.TrackedProductsUri)).EnumerateArray());
        Assert.Empty((await api.GetJsonAsync(ApiScenarioClient.ConsumptionLogsUri)).EnumerateArray());
        familyDetails = await api.GetJsonAsync($"{ApiScenarioClient.ProductFamiliesUri}/{family.EntityId}");
        Assert.Equal(0, familyDetails.GetProperty("productsCount").GetInt32());

        // Step 12: Delete the now-empty product family and category.
        await api.DeleteAsync($"{ApiScenarioClient.ProductFamiliesUri}/{family.EntityId}");
        await api.DeleteAsync($"{ApiScenarioClient.CategoriesUri}/{category.EntityId}");
        Assert.Equal(HttpStatusCode.NotFound, (await api.GetAsync($"{ApiScenarioClient.ProductFamiliesUri}/{family.EntityId}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await api.GetAsync($"{ApiScenarioClient.CategoriesUri}/{category.EntityId}")).StatusCode);
    }

    /*
     * Scenario Summary:
     * A product family can be renamed and moved to another category, and the products it owns follow it.
     *
     * Steps:
     * 1. Create two categories.
     * 2. Create a product family in the first category with a product in it.
     * 3. Rename the family and move it to the second category.
     * 4. Validate the family and its product report the new category.
     */
    [Fact]
    public async Task ProductFamilyUpdate_WhenMovedToAnotherCategory_MovesItsProductsAlong()
    {
        // Arrange
        using var factory = new PrepperBoxWebApiFactory();
        using var httpClient = factory.CreateClient();
        var api = new ApiScenarioClient(httpClient);

        // Step 1: Create two categories.
        var sourceCategory = await api.CreateCategoryAsync("Integration Source", iconName: "source");
        var targetCategory = await api.CreateCategoryAsync("Integration Target", iconName: "target");

        // Step 2: Create a product family in the first category with a product in it.
        var family = await api.CreateProductFamilyAsync(sourceCategory.EntityId, "Integration Jars", UnitOfMeasure.Piece);
        var product = await api.CreateProductAsync(family.EntityId, "Integration Jam");

        // Step 3: Rename the family and move it to the second category.
        var movedFamily = await api.UpdateProductFamilyAsync(
            family.EntityId,
            family.LastModified,
            targetCategory.EntityId,
            "Integration Jars Renamed",
            UnitOfMeasure.Kilogram,
            minimumStockLevel: 2);

        // Step 4: Validate the family and its product report the new category.
        var familyDetails = await api.GetJsonAsync($"{ApiScenarioClient.ProductFamiliesUri}/{family.EntityId}");
        Assert.Equal(movedFamily.LastModified, ApiScenarioClient.LastModified(familyDetails));
        Assert.Equal("Integration Jars Renamed", ApiScenarioClient.Name(familyDetails));
        Assert.Equal(targetCategory.EntityId, familyDetails.GetProperty("categoryId").GetInt32());
        Assert.Equal((int)UnitOfMeasure.Kilogram, familyDetails.GetProperty("unitOfMeasure").GetInt32());
        Assert.Equal(2, familyDetails.GetProperty("minimumStockLevel").GetInt32());

        var productDetails = await api.GetJsonAsync($"{ApiScenarioClient.ProductsUri}/{product.EntityId}");
        Assert.Equal(targetCategory.EntityId, productDetails.GetProperty("categoryId").GetInt32());
    }
}
