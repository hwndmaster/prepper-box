using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Genius.PrepperBox.Db.Migrations
{
    /// <inheritdoc />
    public partial class AddProductFamily : Migration
    {
        // The Products table is rebuilt via an explicit CreateTable + copy + rename rather than
        // in-place AddColumn/DropColumn. EF's SQLite in-place rebuild regenerates the table from the
        // (alphabetically ordered) snapshot model and re-emits AUTOINCREMENT, which diverges from the
        // declaration-ordered, AUTOINCREMENT-free schema that EnsureCreated produces. The migration
        // drift test compares the two schemas byte-for-byte, so the new table must be created the same
        // way InitialCreate created it. Foreign keys are disabled around the swap (outside the
        // transaction, so the PRAGMA takes effect) to allow dropping the referenced Products table
        // without cascading into TrackedProducts / ConsumptionLogs.

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("PRAGMA foreign_keys = OFF;", suppressTransaction: true);

            // 1) Create the ProductFamilies table.
            migrationBuilder.CreateTable(
                name: "ProductFamilies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false),
                    CategoryId = table.Column<int>(type: "INTEGER", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    UnitOfMeasure = table.Column<int>(type: "INTEGER", nullable: false),
                    MinimumStockLevel = table.Column<int>(type: "INTEGER", nullable: false),
                    DateCreated = table.Column<long>(type: "INTEGER", nullable: false),
                    LastModified = table.Column<long>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductFamilies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductFamilies_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            // 2a) Seed the reference families onto pre-existing databases. Guarded by category
            //     existence so that on a fresh database (categories are seeded at runtime, after
            //     migrations) this inserts nothing and the runtime initializer seeds instead.
            //     UnitOfMeasure: Piece=0, Kilogram=1, Can=2, Liter=3. Ids match the constants in
            //     PrepperBoxDbInitializer so fresh and migrated databases stay consistent.
            migrationBuilder.Sql("""
                INSERT INTO "ProductFamilies" ("Id", "CategoryId", "Name", "UnitOfMeasure", "MinimumStockLevel", "DateCreated", "LastModified")
                SELECT seed."Id", seed."CategoryId", seed."Name", seed."UnitOfMeasure", 0,
                       CAST(strftime('%s', 'now') AS INTEGER), CAST(strftime('%s', 'now') AS INTEGER)
                FROM (
                             SELECT 1  AS "Id", 1 AS "CategoryId", 'Soups'             AS "Name", 2 AS "UnitOfMeasure"
                    UNION ALL SELECT 2,       1,                   'Noodles',                0
                    UNION ALL SELECT 3,       1,                   'Canned fish',            2
                    UNION ALL SELECT 4,       1,                   'Canned meat',            2
                    UNION ALL SELECT 5,       1,                   'Canned veggies',         2
                    UNION ALL SELECT 6,       1,                   'Sweets',      0
                    UNION ALL SELECT 7,       1,                   'Biscuits',               0
                    UNION ALL SELECT 8,       1,                   'Misc (Pieces)',          0
                    UNION ALL SELECT 9,       1,                   'Misc (By weight)',       1
                    UNION ALL SELECT 10,      1,                   'Misc (Cans)',            2
                    UNION ALL SELECT 11,      2,                   'Misc (Liters)',          3
                    UNION ALL SELECT 12,      3,                   'Misc (Pieces)',          0
                    UNION ALL SELECT 13,      4,                   'Misc (Pieces)',          0
                    UNION ALL SELECT 14,      5,                   'Misc (Pieces)',          0
                    UNION ALL SELECT 15,      6,                   'Misc (Pieces)',          0
                ) AS seed
                WHERE seed."CategoryId" IN (SELECT "Id" FROM "Categories")
                  AND NOT EXISTS (SELECT 1 FROM "ProductFamilies" existing WHERE existing."Id" = seed."Id");
                """);

            // 2b) For any (category, unit) combination present in existing products that no family
            //     covers yet, auto-create a "Misc (<unit>)" family. Guarantees every existing product
            //     can be mapped to a family (no orphans), regardless of custom categories or units.
            migrationBuilder.Sql("""
                INSERT INTO "ProductFamilies" ("CategoryId", "Name", "UnitOfMeasure", "MinimumStockLevel", "DateCreated", "LastModified")
                SELECT DISTINCT p."CategoryId",
                       'Misc (' || CASE p."UnitOfMeasure"
                                       WHEN 0 THEN 'Pieces'
                                       WHEN 1 THEN 'By weight'
                                       WHEN 2 THEN 'Cans'
                                       WHEN 3 THEN 'Liters'
                                       ELSE 'Other'
                                   END || ')',
                       p."UnitOfMeasure", 0,
                       CAST(strftime('%s', 'now') AS INTEGER), CAST(strftime('%s', 'now') AS INTEGER)
                FROM "Products" p
                WHERE NOT EXISTS (
                    SELECT 1 FROM "ProductFamilies" f
                    WHERE f."CategoryId" = p."CategoryId" AND f."UnitOfMeasure" = p."UnitOfMeasure"
                );
                """);

            // 3) Create the new Products table with an explicit column order matching the model
            //    (this is what EnsureCreated produces; see the note above).
            migrationBuilder.CreateTable(
                name: "ProductsNew",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    FamilyId = table.Column<int>(type: "INTEGER", nullable: false),
                    Manufacturer = table.Column<string>(type: "TEXT", nullable: true),
                    BarCode = table.Column<string>(type: "TEXT", nullable: true),
                    ImageUrl = table.Column<string>(type: "TEXT", nullable: true),
                    ImageSmallUrl = table.Column<string>(type: "TEXT", nullable: true),
                    DateCreated = table.Column<long>(type: "INTEGER", nullable: false),
                    LastModified = table.Column<long>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Products_ProductFamilies_FamilyId",
                        column: x => x.FamilyId,
                        principalTable: "ProductFamilies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            // 4) Copy products across, backfilling FamilyId from each product's (CategoryId,
            //    UnitOfMeasure), preferring the "Misc (...)" family for that combination.
            migrationBuilder.Sql("""
                INSERT INTO "ProductsNew" ("Id", "Name", "Description", "FamilyId", "Manufacturer", "BarCode", "ImageUrl", "ImageSmallUrl", "DateCreated", "LastModified")
                SELECT p."Id", p."Name", p."Description",
                       (SELECT f."Id" FROM "ProductFamilies" f
                        WHERE f."CategoryId" = p."CategoryId" AND f."UnitOfMeasure" = p."UnitOfMeasure"
                        ORDER BY (CASE WHEN f."Name" LIKE 'Misc %' THEN 0 ELSE 1 END), f."Id"
                        LIMIT 1),
                       p."Manufacturer", p."BarCode", p."ImageUrl", p."ImageSmallUrl", p."DateCreated", p."LastModified"
                FROM "Products" p;
                """);

            // 5) Replace the old Products table with the new one.
            migrationBuilder.DropTable(name: "Products");
            migrationBuilder.RenameTable(name: "ProductsNew", newName: "Products");

            // 6) Indexes.
            migrationBuilder.CreateIndex(
                name: "IX_Products_FamilyId",
                table: "Products",
                column: "FamilyId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductFamilies_CategoryId_Name",
                table: "ProductFamilies",
                columns: new[] { "CategoryId", "Name" },
                unique: true);

            migrationBuilder.Sql("PRAGMA foreign_keys = ON;", suppressTransaction: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("PRAGMA foreign_keys = OFF;", suppressTransaction: true);

            // Recreate the pre-migration Products table.
            migrationBuilder.CreateTable(
                name: "ProductsOld",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    CategoryId = table.Column<int>(type: "INTEGER", nullable: false),
                    Manufacturer = table.Column<string>(type: "TEXT", nullable: true),
                    BarCode = table.Column<string>(type: "TEXT", nullable: true),
                    ImageUrl = table.Column<string>(type: "TEXT", nullable: true),
                    ImageSmallUrl = table.Column<string>(type: "TEXT", nullable: true),
                    UnitOfMeasure = table.Column<int>(type: "INTEGER", nullable: false),
                    MinimumStockLevel = table.Column<int>(type: "INTEGER", nullable: false),
                    DateCreated = table.Column<long>(type: "INTEGER", nullable: false),
                    LastModified = table.Column<long>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Products_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            // Copy back, recovering category / unit / minimum-stock from the family.
            migrationBuilder.Sql("""
                INSERT INTO "ProductsOld" ("Id", "Name", "Description", "CategoryId", "Manufacturer", "BarCode", "ImageUrl", "ImageSmallUrl", "UnitOfMeasure", "MinimumStockLevel", "DateCreated", "LastModified")
                SELECT p."Id", p."Name", p."Description",
                       COALESCE((SELECT f."CategoryId" FROM "ProductFamilies" f WHERE f."Id" = p."FamilyId"), 0),
                       p."Manufacturer", p."BarCode", p."ImageUrl", p."ImageSmallUrl",
                       COALESCE((SELECT f."UnitOfMeasure" FROM "ProductFamilies" f WHERE f."Id" = p."FamilyId"), 0),
                       COALESCE((SELECT f."MinimumStockLevel" FROM "ProductFamilies" f WHERE f."Id" = p."FamilyId"), 0),
                       p."DateCreated", p."LastModified"
                FROM "Products" p;
                """);

            migrationBuilder.DropTable(name: "Products");
            migrationBuilder.RenameTable(name: "ProductsOld", newName: "Products");
            migrationBuilder.DropTable(name: "ProductFamilies");

            migrationBuilder.CreateIndex(
                name: "IX_Products_CategoryId",
                table: "Products",
                column: "CategoryId");

            migrationBuilder.Sql("PRAGMA foreign_keys = ON;", suppressTransaction: true);
        }
    }
}
