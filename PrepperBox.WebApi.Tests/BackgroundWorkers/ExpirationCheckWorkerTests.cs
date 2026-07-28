using Genius.PrepperBox.Core.Configuration;
using Genius.PrepperBox.Core.Services.Telegram;
using Genius.PrepperBox.Db.Repositories;
using Genius.PrepperBox.Dto;
using Genius.PrepperBox.WebApi.BackgroundWorkers;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Genius.PrepperBox.WebApi.Tests;

public sealed class ExpirationCheckWorkerTests
{
    private static readonly TimeSpan CheckTimeout = TimeSpan.FromSeconds(30);

    private readonly ITrackedProductsRepository _trackedProductsRepository = A.Fake<ITrackedProductsRepository>();
    private readonly IProductsRepository _productsRepository = A.Fake<IProductsRepository>();
    private readonly ITelegramNotificationService _telegramNotificationService = A.Fake<ITelegramNotificationService>();
    private readonly SignallingLogger _logger = new();

    [Fact]
    public async Task ExecuteAsync_GivenExpiringStock_SendsSingleGroupedNotification()
    {
        // Arrange
        var today = DateTimeOffset.Now;
        SetupStock(
            [
                CreateTrackedProduct(1, productId: 1, expirationDate: today),
                CreateTrackedProduct(2, productId: 2, expirationDate: today.AddDays(10)),
                CreateTrackedProduct(3, productId: 3, expirationDate: today.AddDays(45)),
                CreateTrackedProduct(4, productId: 4, expirationDate: null),
                CreateTrackedProduct(5, productId: 4, expirationDate: today.AddDays(200))
            ],
            [
                CreateProduct(1, "Canned Beans"),
                CreateProduct(2, "Still Water"),
                CreateProduct(4, "Multi-tool")
            ]);

        string? sentMessage = null;
        A.CallTo(() => _telegramNotificationService.SendMessageAsync(A<string>._, A<CancellationToken>._))
            .Invokes((string message, CancellationToken _) => sentMessage = message);

        // Act
        await RunSingleCheckAsync();

        // Assert
        A.CallTo(() => _telegramNotificationService.SendMessageAsync(A<string>._, A<CancellationToken>._))
            .MustHaveHappenedOnceExactly();
        Assert.NotNull(sentMessage);
        Assert.Contains("<b>Canned Beans</b> expires <b>today</b>!", sentMessage, StringComparison.Ordinal);
        Assert.Contains("<b>Still Water</b> expires in <b>10 day(s)</b>.", sentMessage, StringComparison.Ordinal);
        // Product #3 is not in the products list, so it falls back to its identifier.
        Assert.Contains("<b>Product #3</b> expires in <b>45 day(s)</b>.", sentMessage, StringComparison.Ordinal);
        // Neither the stock without an expiration date nor the one expiring in 200 days is reported.
        Assert.DoesNotContain("Multi-tool", sentMessage, StringComparison.Ordinal);
    }

    [Fact]
    public async Task ExecuteAsync_WhenNothingIsAboutToExpire_DoesNotNotify()
    {
        // Arrange
        var today = DateTimeOffset.Now;
        SetupStock(
            [
                CreateTrackedProduct(1, productId: 1, expirationDate: null),
                CreateTrackedProduct(2, productId: 1, expirationDate: today.AddYears(2))
            ],
            [CreateProduct(1, "Sugar")]);

        // Act
        await RunSingleCheckAsync();

        // Assert
        A.CallTo(() => _telegramNotificationService.SendMessageAsync(A<string>._, A<CancellationToken>._))
            .MustNotHaveHappened();
    }

    private void SetupStock(TrackedProductDto[] trackedProducts, ProductDto[] products)
    {
        A.CallTo(() => _trackedProductsRepository.GetAllAsync(A<CancellationToken>._))
            .Returns(Task.FromResult<IEnumerable<TrackedProductDto>>(trackedProducts));
        A.CallTo(() => _productsRepository.GetAllAsync(A<CancellationToken>._))
            .Returns(Task.FromResult<IEnumerable<ProductDto>>(products));
    }

    /// <summary>
    /// Starts the worker configured to run its daily check immediately, and waits until that single
    /// check has completed (the worker then reschedules itself for the next day).
    /// </summary>
    private async Task RunSingleCheckAsync()
    {
        var services = new ServiceCollection()
            .AddSingleton(_trackedProductsRepository)
            .AddSingleton(_productsRepository)
            .AddSingleton(_telegramNotificationService)
            .BuildServiceProvider();

        var settings = Options.Create(new ExpirationCheckSettings
        {
            NotificationTime = TimeSpan.Zero,
            NotificationWindowMinutes = 24 * 60
        });

        using var worker = new ExpirationCheckWorker(
            services.GetRequiredService<IServiceScopeFactory>(),
            settings,
            _logger);

        await worker.StartAsync(TestContext.Current.CancellationToken);
        await _logger.CheckCompleted.WaitAsync(CheckTimeout, TestContext.Current.CancellationToken);
        await worker.StopAsync(TestContext.Current.CancellationToken);
    }

    private static TrackedProductDto CreateTrackedProduct(int id, int productId, DateTimeOffset? expirationDate)
        => new(id, productId, 1, expirationDate, Quantity: 3, Notes: null, DateTimeOffset.UnixEpoch, DateTimeOffset.UnixEpoch);

    private static ProductDto CreateProduct(int id, string name)
        => new(id, name, null, 1, 1, null, null, null, null, TrackedProductsCount: 3, DateTimeOffset.UnixEpoch, DateTimeOffset.UnixEpoch);

    /// <summary>
    /// Logger which completes <see cref="CheckCompleted"/> as soon as the worker logs the outcome of an
    /// expiration check, giving the tests a deterministic signal instead of polling or sleeping.
    /// </summary>
    private sealed class SignallingLogger : ILogger<ExpirationCheckWorker>
    {
        private static readonly NoopScope Scope = new();

        private readonly TaskCompletionSource _checkCompleted = new(TaskCreationOptions.RunContinuationsAsynchronously);

        public Task CheckCompleted => _checkCompleted.Task;

        public IDisposable BeginScope<TState>(TState state)
            where TState : notnull
            => Scope;

        public bool IsEnabled(LogLevel logLevel) => true;

        public void Log<TState>(
            LogLevel logLevel,
            EventId eventId,
            TState state,
            Exception? exception,
            Func<TState, Exception?, string> formatter)
        {
            var message = formatter.NotNull()(state, exception);
            if (message.StartsWith("Sent expiration notification", StringComparison.Ordinal)
                || message.StartsWith("No expiring products found", StringComparison.Ordinal))
            {
                _checkCompleted.TrySetResult();
            }
        }

        private sealed class NoopScope : IDisposable
        {
            public void Dispose()
            {
                // Nothing to release.
            }
        }
    }
}
