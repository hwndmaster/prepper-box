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
}
