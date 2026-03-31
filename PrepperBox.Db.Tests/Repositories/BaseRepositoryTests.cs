using Genius.Atom.Infrastructure.TestingUtil;
using Microsoft.EntityFrameworkCore;

namespace Genius.PrepperBox.Db.Tests;

public abstract class BaseRepositoryTests<TKey, TReference, TGetDto, TCreateDto, TUpdateDto, TRepository>
    : IDbContextProvider
    where TKey : notnull
    where TReference : IReference<TKey, TReference>
    where TUpdateDto : IPrimaryId<TKey, TReference>, ITimeStamped
    where TRepository : IRepository<TKey, TReference, TGetDto, TCreateDto, TUpdateDto>
{
    private readonly Lazy<TRepository> _repository;
    private readonly DbContextOptions<PrepperBoxDbContext> _dbOptions;

    protected FakeDateTime FakeDateTime = new();
    protected TRepository Repository => _repository.Value;

    protected BaseRepositoryTests()
    {
        _dbOptions = new DbContextOptionsBuilder<PrepperBoxDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        // Seed the in-memory database with test data
        var dbContext = new PrepperBoxDbContext(_dbOptions);
        PrepperBoxDbInitializer.SeedAsync(dbContext, isDevelopment: true).Wait();
        dbContext.Dispose();

        _repository = new Lazy<TRepository>(() => CreateRepository(this));
    }

    [Fact]
    public async Task GetAllAsync_ReturnsResults()
    {
        // Act
        var result = await Repository.GetAllAsync(cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        Assert.NotNull(result);
        Assert.NotEmpty(result);
    }

    [Fact]
    public async Task CreateAsync_ReturnsCreatedEntity()
    {
        // Arrange
        var createDto = CreateSampleCreateDto();

        // Act
        var result = await Repository.CreateAsync(createDto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        Assert.NotNull(result);
        Assert.NotEqual(default(TKey), result.EntityId.Id);
        Assert.NotEqual(default, result.LastModified);
    }

    [Fact]
    public async Task UpdateAsync_ReturnsUpdatedEntity()
    {
        // Arrange
        var created = await Repository.CreateAsync(CreateSampleCreateDto(), cancellationToken: TestContext.Current.CancellationToken);
        var updateDto = CreateSampleUpdateDto(created.EntityId.Id, created.LastModified);
        FakeDateTime.Advance(TimeSpan.FromMinutes(5)); // Ensure LastModified will be different after update

        // Act
        var result = await Repository.UpdateAsync(updateDto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(created.EntityId.Id, result.EntityId.Id);
        Assert.NotEqual(created.LastModified, result.LastModified);
    }

    [Fact]
    public async Task DeleteAsync_CompletesSuccessfully()
    {
        // Arrange
        var created = await Repository.CreateAsync(CreateSampleCreateDto(), cancellationToken: TestContext.Current.CancellationToken);

        // Act
        var exception = await Record.ExceptionAsync(
            () => Repository.DeleteAsync(TReference.Create(created.EntityId.Id), cancellationToken: TestContext.Current.CancellationToken));

        // Assert
        Assert.Null(exception);
    }

    public DbContext GetDbContext() => new PrepperBoxDbContext(_dbOptions);

    protected abstract TRepository CreateRepository(IDbContextProvider dbContextProvider);
    protected abstract TCreateDto CreateSampleCreateDto();
    protected abstract TUpdateDto CreateSampleUpdateDto(TKey id, DateTimeOffset lastModified);
}
