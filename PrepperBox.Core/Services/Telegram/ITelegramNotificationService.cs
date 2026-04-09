namespace Genius.PrepperBox.Core.Services.Telegram;

/// <summary>
/// Service for sending Telegram notifications.
/// </summary>
public interface ITelegramNotificationService
{
    /// <summary>
    /// Sends a message to the configured Telegram chat.
    /// </summary>
    /// <param name="message">The message text (supports HTML formatting).</param>
    /// <param name="cancellationToken">A cancellation token.</param>
    Task SendMessageAsync(string message, CancellationToken cancellationToken = default);
}
