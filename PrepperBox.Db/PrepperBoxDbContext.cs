using Genius.PrepperBox.Db.Models;
using Genius.PrepperBox.Dto.References;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Genius.PrepperBox.Db;

public sealed class PrepperBoxDbContext : DbContext
{
    public PrepperBoxDbContext(DbContextOptions<PrepperBoxDbContext> options)
        : base(options)
    {
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        Guard.NotNull(optionsBuilder);
        base.OnConfiguring(optionsBuilder);

        // The value-converted reference-type primary keys make SQLite serialize an AUTOINCREMENT annotation
        // into the migrations snapshot that is absent from the runtime model, so EF always believes the model
        // has pending changes. The difference is cosmetic (an INTEGER PRIMARY KEY auto-assigns row ids either
        // way), so ignore the warning to allow MigrateAsync to run. Real schema changes are still captured by
        // explicitly added migrations, and the InitialCreateMigration_ProducesSameSchemaAsEnsureCreated test
        // guards against actual drift between the model and the migrations.
        optionsBuilder.ConfigureWarnings(warnings =>
            warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
    }

    override protected void OnModelCreating(ModelBuilder modelBuilder)
    {
        Guard.NotNull(modelBuilder);
        base.OnModelCreating(modelBuilder);

        // Configure reference type value conversions for entity IDs
        modelBuilder.ConfigureReferenceId<Category, CategoryRef>(id => new CategoryRef(id));
        modelBuilder.ConfigureReferenceId<ProductFamily, ProductFamilyRef>(id => new ProductFamilyRef(id));
        modelBuilder.ConfigureReferenceId<Product, ProductRef>(id => new ProductRef(id));
        modelBuilder.ConfigureReferenceId<StorageLocation, StorageLocationRef>(id => new StorageLocationRef(id));
        modelBuilder.ConfigureReferenceId<TrackedProduct, TrackedProductRef>(id => new TrackedProductRef(id));
        modelBuilder.ConfigureReferenceId<ConsumptionLog, ConsumptionLogRef>(id => new ConsumptionLogRef(id));

        // Configure reference type value conversions for foreign key properties
        modelBuilder.ConfigureReferenceFk<ProductFamily, CategoryRef>(nameof(ProductFamily.CategoryId), id => new CategoryRef(id));
        modelBuilder.ConfigureReferenceFk<Product, ProductFamilyRef>(nameof(Product.FamilyId), id => new ProductFamilyRef(id));
        modelBuilder.ConfigureReferenceFk<TrackedProduct, ProductRef>(nameof(TrackedProduct.ProductId), id => new ProductRef(id));
        modelBuilder.ConfigureReferenceFk<TrackedProduct, StorageLocationRef>(nameof(TrackedProduct.StorageLocationId), id => new StorageLocationRef(id));
        modelBuilder.ConfigureReferenceFk<ConsumptionLog, ProductRef>(nameof(ConsumptionLog.ProductId), id => new ProductRef(id));

        // Configure ProductFamily N:1 relationship with Category (FK constraint)
        modelBuilder.Entity<ProductFamily>()
            .HasOne(f => f.Category)
            .WithMany(c => c.ProductFamilies)
            .HasForeignKey(f => f.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // Enforce a unique family name within a category
        modelBuilder.Entity<ProductFamily>()
            .HasIndex(nameof(ProductFamily.CategoryId), nameof(ProductFamily.Name))
            .IsUnique();

        // Configure Product N:1 relationship with ProductFamily (FK constraint)
        modelBuilder.Entity<Product>()
            .HasOne(p => p.ProductFamily)
            .WithMany(f => f.Products)
            .HasForeignKey(p => p.FamilyId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure TrackedProduct N:1 relationship with Product (FK constraint)
        modelBuilder.Entity<TrackedProduct>()
            .HasOne(tp => tp.Product)
            .WithMany(p => p.TrackedProducts)
            .HasForeignKey(tp => tp.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure ConsumptionLog N:1 relationship with Product (FK constraint)
        modelBuilder.Entity<ConsumptionLog>()
            .HasOne(cl => cl.Product)
            .WithMany(p => p.ConsumptionLogs)
            .HasForeignKey(cl => cl.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        // Apply DateTimeOffset to Unix timestamp conversion for all entities
        var dateTimeOffsetConverter = new ValueConverter<DateTimeOffset, long>(
            v => v.ToUnixTimeSeconds(),
            v => DateTimeOffset.FromUnixTimeSeconds(v)
        );
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties().Where(p => p.ClrType == typeof(DateTimeOffset)))
            {
                property.SetValueConverter(dateTimeOffsetConverter);
            }
        }
    }

    public DbSet<Category> Categories { get; set; }
    public DbSet<ProductFamily> ProductFamilies { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<StorageLocation> StorageLocations { get; set; }
    public DbSet<TrackedProduct> TrackedProducts { get; set; }
    public DbSet<ConsumptionLog> ConsumptionLogs { get; set; }
}
