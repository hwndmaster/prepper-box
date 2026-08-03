using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Genius.PrepperBox.Db.Migrations
{
    /// <inheritdoc />
    public partial class ProductFamilyDecimalMinimumStockLevel : Migration
    {
        // ProductFamily.MinimumStockLevel becomes a decimal so fractional targets (e.g. 0.5 kg) can be
        // set. SQLite stores decimal as TEXT, so the column type changes from INTEGER to TEXT.
        //
        // The table is rebuilt via an explicit CreateTable + copy + rename rather than AlterColumn.
        // EF's SQLite in-place rebuild regenerates the table from the (alphabetically ordered) snapshot
        // model and re-emits AUTOINCREMENT, which diverges from the declaration-ordered,
        // AUTOINCREMENT-free schema that EnsureCreated produces. The migration drift test compares the
        // two schemas byte-for-byte, so the new table must be created the same way AddProductFamily
        // created it. Foreign keys are disabled around the swap (outside the transaction, so the PRAGMA
        // takes effect) to allow dropping the referenced ProductFamilies table without cascading into
        // Products.

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("PRAGMA foreign_keys = OFF;", suppressTransaction: true);

            migrationBuilder.CreateTable(
                name: "ProductFamiliesNew",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false),
                    CategoryId = table.Column<int>(type: "INTEGER", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    UnitOfMeasure = table.Column<int>(type: "INTEGER", nullable: false),
                    MinimumStockLevel = table.Column<decimal>(type: "TEXT", nullable: false),
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

            // The old column only ever held integers, so appending '.0' yields the canonical
            // "0.0###########################" text form that EF's SQLite decimal mapping writes.
            migrationBuilder.Sql("""
                INSERT INTO "ProductFamiliesNew" ("Id", "CategoryId", "Name", "UnitOfMeasure", "MinimumStockLevel", "DateCreated", "LastModified")
                SELECT f."Id", f."CategoryId", f."Name", f."UnitOfMeasure",
                       CAST(CAST(f."MinimumStockLevel" AS INTEGER) AS TEXT) || '.0',
                       f."DateCreated", f."LastModified"
                FROM "ProductFamilies" f;
                """);

            migrationBuilder.DropTable(name: "ProductFamilies");
            migrationBuilder.RenameTable(name: "ProductFamiliesNew", newName: "ProductFamilies");

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

            migrationBuilder.CreateTable(
                name: "ProductFamiliesOld",
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

            // Fractional targets cannot be represented by the integer column and are truncated.
            migrationBuilder.Sql("""
                INSERT INTO "ProductFamiliesOld" ("Id", "CategoryId", "Name", "UnitOfMeasure", "MinimumStockLevel", "DateCreated", "LastModified")
                SELECT f."Id", f."CategoryId", f."Name", f."UnitOfMeasure",
                       CAST(CAST(f."MinimumStockLevel" AS REAL) AS INTEGER),
                       f."DateCreated", f."LastModified"
                FROM "ProductFamilies" f;
                """);

            migrationBuilder.DropTable(name: "ProductFamilies");
            migrationBuilder.RenameTable(name: "ProductFamiliesOld", newName: "ProductFamilies");

            migrationBuilder.CreateIndex(
                name: "IX_ProductFamilies_CategoryId_Name",
                table: "ProductFamilies",
                columns: new[] { "CategoryId", "Name" },
                unique: true);

            migrationBuilder.Sql("PRAGMA foreign_keys = ON;", suppressTransaction: true);
        }
    }
}
