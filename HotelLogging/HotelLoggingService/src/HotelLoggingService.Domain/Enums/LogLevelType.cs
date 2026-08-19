namespace HotelLoggingService.Domain.Enums;

/// <summary>
/// Represents the severity level of a log entry.
/// Named "LogLevelType" (rather than "LogLevel") to avoid collision with
/// Microsoft.Extensions.Logging.LogLevel used elsewhere in the API layer.
/// </summary>
public enum LogLevelType
{
    Debug = 0,
    Information = 1,
    Warning = 2,
    Error = 3,
    Critical = 4
}
