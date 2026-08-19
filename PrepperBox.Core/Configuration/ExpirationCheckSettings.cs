namespace Genius.PrepperBox.Core.Configuration;

/// <summary>
/// Configuration for the expiration check background worker.
/// </summary>
public sealed class ExpirationCheckSettings
{
    public const string SectionName = "ExpirationCheck";

    /// <summary>
    /// Daily server-local time when expiration checks should run.
    /// </summary>
    public TimeSpan NotificationTime { get; set; } = TimeSpan.FromHours(9);

    /// <summary>
    /// Backward-compatible legacy setting key. If specified, this value is treated as server-local time.
    /// </summary>
    public TimeSpan? NotificationTimeUtc { get; set; }

    /// <summary>
    /// Optional startup tolerance window in minutes after NotificationTime.
    /// If the app starts within this window, the check runs immediately.
    /// </summary>
    public int NotificationWindowMinutes { get; set; } = 30;

    /// <summary>
    /// How often, in days, a product in the "green" zone (between 1 and 2 months before expiration)
    /// is included in the notification. A product is reported only when its remaining days
    /// are a multiple of this interval. Must be at least 1 (1 = every day).
    /// </summary>
    public int GreenNotificationIntervalDays { get; set; } = 5;
}
