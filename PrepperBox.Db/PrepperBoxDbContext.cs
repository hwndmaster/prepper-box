using System.Linq.Expressions;
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
        ConfigureReferenceId<Category, CategoryRef>(modelBuilder, id => new CategoryRef(id));
        ConfigureReferenceId<ProductFamily, ProductFamilyRef>(modelBuilder, id => new ProductFamilyRef(id));
        ConfigureReferenceId<Product, ProductRef>(modelBuilder, id => new ProductRef(id));
        ConfigureReferenceId<StorageLocation, StorageLocationRef>(modelBuilder, id => new StorageLocationRef(id));
        ConfigureReferenceId<TrackedProduct, TrackedProductRef>(modelBuilder, id => new TrackedProductRef(id));
        ConfigureReferenceId<ConsumptionLog, ConsumptionLogRef>(modelBuilder, id => new ConsumptionLogRef(id));

        // Configure reference type value conversions for foreign key properties
        ConfigureReferenceFk<ProductFamily, CategoryRef>(modelBuilder, nameof(ProductFamily.CategoryId), id => new CategoryRef(id));
        ConfigureReferenceFk<Product, ProductFamilyRef>(modelBuilder, nameof(Product.FamilyId), id => new ProductFamilyRef(id));
        ConfigureReferenceFk<TrackedProduct, ProductRef>(modelBuilder, nameof(TrackedProduct.ProductId), id => new ProductRef(id));
        ConfigureReferenceFk<TrackedProduct, StorageLocationRef>(modelBuilder, nameof(TrackedProduct.StorageLocationId), id => new StorageLocationRef(id));
        ConfigureReferenceFk<ConsumptionLog, ProductRef>(modelBuilder, nameof(ConsumptionLog.ProductId), id => new ProductRef(id));

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

    /// <summary>
    /// Configures a value conversion for the <see cref="EntityOnInt32Base{TReference}.Id"/> property
    /// to map between a strongly-typed <typeparamref name="TReference"/> and an <see cref="int"/> in the database.
    /// </summary>
    private static void ConfigureReferenceId<TEntity, TReference>(ModelBuilder modelBuilder,
        Expression<Func<int, TReference>> fromProvider)
        where TEntity : EntityBase<int, TReference>
        where TReference : IReference<int, TReference>
    {
        modelBuilder.Entity<TEntity>()
            .Property(e => e.Id)
            .HasConversion(
                r => r.Id,
                fromProvider)
            .ValueGeneratedOnAdd()
            .HasSentinel(TReference.Create(0));
    }

    /// <summary>
    /// Configures a value conversion for a foreign key property of type <typeparamref name="TReference"/>
    /// to map between the strongly-typed reference and an <see cref="int"/> in the database.
    /// </summary>
    private static void ConfigureReferenceFk<TEntity, TReference>(ModelBuilder modelBuilder,
        string propertyName, Expression<Func<int, TReference>> fromProvider)
        where TEntity : class
        where TReference : IReference<int, TReference>
    {
        modelBuilder.Entity<TEntity>()
            .Property<TReference>(propertyName)
            .HasConversion(
                r => r.Id,
                fromProvider);
    }

    public DbSet<Category> Categories { get; set; }
    public DbSet<ProductFamily> ProductFamilies { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<StorageLocation> StorageLocations { get; set; }
    public DbSet<TrackedProduct> TrackedProducts { get; set; }
    public DbSet<ConsumptionLog> ConsumptionLogs { get; set; }
}
