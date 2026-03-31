using Microsoft.EntityFrameworkCore;

namespace Genius.PrepperBox.Db;

internal class DbContextProvider : IDbContextProvider
{
    private readonly DbContextOptions<PrepperBoxDbContext> _options;

    public DbContextProvider(DbContextOptions<PrepperBoxDbContext> options)
    {
        _options = options.NotNull();
    }

    public DbContext GetDbContext() => new PrepperBoxDbContext(_options);
}
