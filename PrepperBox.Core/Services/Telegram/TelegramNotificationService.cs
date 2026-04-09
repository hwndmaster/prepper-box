using System.Net.Http.Json;
using Genius.PrepperBox.Core.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Genius.PrepperBox.Core.Services.Telegram;

/// <summary>
/// Sends messages via the Telegram Bot API.
/// </summary>
internal sealed class TelegramNotificationService : ITelegramNotificationService
{
    private readonly HttpClient _httpClient;
    private readonly TelegramSettings _settings;
    private readonly ILogger<TelegramNotificationService> _logger;

    public TelegramNotificationService(
        HttpClient httpClient,
        IOptions<TelegramSettings> settings,
        ILogger<TelegramNotificationService> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task SendMessageAsync(string message, CancellationToken cancellationToken = default)
    {
        if (!_settings.IsConfigured)
        {
            _logger.LogWarning("Telegram is not configured. Skipping notification.");
            return;
        }

        var url = $"https://api.telegram.org/bot{_settings.BotToken}/sendMessage";

        var payload = new
        {
            chat_id = _settings.ChatId,
            text = message,
            parse_mode = "HTML"
        };

        try
        {
            var response = await _httpClient.PostAsJsonAsync(url, payload, cancellationToken)
                .ConfigureAwait(false);
            response.EnsureSuccessStatusCode();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send Telegram notification.");
        }
    }
}
