namespace Genius.PrepperBox.Db;

internal partial class PrepperBoxSampleDataInitializer
{
#if HAS_PRIVATE_SAMPLE_DATA_INITIALIZER
    public partial Task SeedSampleDataAsync(PrepperBoxDbContext context, bool isDevelopment);
#else
    public Task SeedSampleDataAsync(PrepperBoxDbContext _, bool __)
    {
        return Task.CompletedTask;
    }
#endif
}
