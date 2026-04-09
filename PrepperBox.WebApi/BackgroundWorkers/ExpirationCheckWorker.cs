using Genius.PrepperBox.Core.Services.Telegram;
using Genius.PrepperBox.Db.Repositories;
using Genius.PrepperBox.Dto;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Genius.PrepperBox.WebApi.BackgroundWorkers;

/// <summary>
/// A background worker that checks tracked product expiration dates once per day
/// and sends Telegram notifications when products are approaching expiration.
/// </summary>
/// <remarks>
/// Notification schedule:
/// <list type="bullet">
///   <item>First notification: 2 months before the expiration date.</item>
///   <item>Second notification: 1 month before the expiration date.</item>
///   <item>Third notification: on the day of the expiration.</item>
/// </list>
/// </remarks>
internal sealed class ExpirationCheckWorker : BackgroundService
{
    private static readonly TimeSpan CheckInterval = TimeSpan.FromDays(1);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ExpirationCheckWorker> _logger;

    public ExpirationCheckWorker(
        IServiceScopeFactory scopeFactory,
        ILogger<ExpirationCheckWorker> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Expiration check worker started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckExpirationsAsync(stoppingToken).ConfigureAwait(false);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                _logger.LogError(ex, "Error during expiration check.");
            }

            await Task.Delay(CheckInterval, stoppingToken).ConfigureAwait(false);
        }
    }

    private async Task CheckExpirationsAsync(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var trackedProductsRepo = scope.ServiceProvider.GetRequiredService<ITrackedProductsRepository>();
        var productsRepo = scope.ServiceProvider.GetRequiredService<IProductsRepository>();
        var telegramService = scope.ServiceProvider.GetRequiredService<ITelegramNotificationService>();

        var trackedProducts = await trackedProductsRepo.GetAllAsync(null, cancellationToken).ConfigureAwait(false);
        var products = await productsRepo.GetAllAsync(null, cancellationToken).ConfigureAwait(false);

        var productLookup = products.ToDictionary(p => p.Id, p => p);
        var today = DateTimeOffset.UtcNow.Date;
        var twoMonthsFromNow = today.AddMonths(2);
        var oneMonthFromNow = today.AddMonths(1);

        var notifications = new List<string>();

        foreach (var tp in trackedProducts)
        {
            if (tp.ExpirationDate is null)
                continue;

            var expirationDate = tp.ExpirationDate.Value.Date;
            var productName = productLookup.TryGetValue(tp.ProductId, out var product)
                ? product.Name
                : $"Product #{tp.ProductId}";

            if (expirationDate == today)
            {
                notifications.Add($"🔴 <b>{productName}</b> expires <b>today</b>! (Qty: {tp.Quantity})");
            }
            else if (expirationDate > today && expirationDate <= oneMonthFromNow)
            {
                var daysLeft = (expirationDate - today).Days;
                notifications.Add($"🟡 <b>{productName}</b> expires in <b>{daysLeft} day(s)</b>. (Qty: {tp.Quantity})");
            }
            else if (expirationDate > oneMonthFromNow && expirationDate <= twoMonthsFromNow)
            {
                var daysLeft = (expirationDate - today).Days;
                notifications.Add($"🟢 <b>{productName}</b> expires in <b>{daysLeft} day(s)</b>. (Qty: {tp.Quantity})");
            }
        }

        if (notifications.Count > 0)
        {
            var message = "📦 <b>Prepper Box — Expiration Alert</b>\n\n"
                + string.Join("\n", notifications);

            await telegramService.SendMessageAsync(message, cancellationToken).ConfigureAwait(false);
            _logger.LogInformation("Sent expiration notification for {Count} product(s).", notifications.Count);
        }
        else
        {
            _logger.LogInformation("No expiring products found.");
        }
    }
}
