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

    override protected void OnModelCreating(ModelBuilder modelBuilder)
    {
        Guard.NotNull(modelBuilder);
        base.OnModelCreating(modelBuilder);

        // Configure reference type value conversions for entity IDs
        ConfigureReferenceId<Category, CategoryRef>(modelBuilder, id => new CategoryRef(id));
        ConfigureReferenceId<Product, ProductRef>(modelBuilder, id => new ProductRef(id));
        ConfigureReferenceId<StorageLocation, StorageLocationRef>(modelBuilder, id => new StorageLocationRef(id));
        ConfigureReferenceId<TrackedProduct, TrackedProductRef>(modelBuilder, id => new TrackedProductRef(id));
        ConfigureReferenceId<ConsumptionLog, ConsumptionLogRef>(modelBuilder, id => new ConsumptionLogRef(id));

        // Configure reference type value conversions for foreign key properties
        ConfigureReferenceFk<Product, CategoryRef>(modelBuilder, nameof(Product.CategoryId), id => new CategoryRef(id));
        ConfigureReferenceFk<TrackedProduct, ProductRef>(modelBuilder, nameof(TrackedProduct.ProductId), id => new ProductRef(id));
        ConfigureReferenceFk<TrackedProduct, StorageLocationRef>(modelBuilder, nameof(TrackedProduct.StorageLocationId), id => new StorageLocationRef(id));
        ConfigureReferenceFk<ConsumptionLog, ProductRef>(modelBuilder, nameof(ConsumptionLog.ProductId), id => new ProductRef(id));

        // Configure Product N:1 relationship with Category (FK constraint)
        modelBuilder.Entity<Product>()
            .HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId);

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
    public DbSet<Product> Products { get; set; }
    public DbSet<StorageLocation> StorageLocations { get; set; }
    public DbSet<TrackedProduct> TrackedProducts { get; set; }
    public DbSet<ConsumptionLog> ConsumptionLogs { get; set; }
}
