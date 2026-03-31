using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Genius.PrepperBox.Db;

/// <summary>
/// This factory is used by EF Core tools to create a DbContext instance at design time (e.g., for migrations).
/// </summary>
internal sealed class PrepperBoxDbContextFactory : IDesignTimeDbContextFactory<PrepperBoxDbContext>
{
    public PrepperBoxDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<PrepperBoxDbContext>();

        var dbPath = Path.Combine("..", "Data", "PrepperBox.db");
        optionsBuilder.UseSqlite($"Data Source={dbPath};Foreign Keys=True");

        return new PrepperBoxDbContext(optionsBuilder.Options);
    }
}
