namespace Genius.PrepperBox.Core.Configuration;

/// <summary>
/// Configuration for the Telegram notification service.
/// </summary>
public sealed class TelegramSettings
{
    public const string SectionName = "Telegram";

    /// <summary>
    /// The Telegram Bot API token.
    /// </summary>
    public string? BotToken { get; set; }

    /// <summary>
    /// The Telegram chat ID to send notifications to.
    /// </summary>
    public string? ChatId { get; set; }

    /// <summary>
    /// Whether Telegram notifications are enabled.
    /// </summary>
    public bool IsConfigured => !string.IsNullOrWhiteSpace(BotToken) && !string.IsNullOrWhiteSpace(ChatId);
}
