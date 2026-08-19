using HotelLoggingService.Domain.Enums;

namespace HotelLoggingService.Domain.Entities;

/// <summary>
/// Represents a single centralized log record submitted by any
/// consuming microservice (e.g. a Java Spring Boot service).
/// </summary>
public class LogEntry
{
    public long Id { get; set; }

    public string ServiceName { get; set; } = string.Empty;

    public string ModuleName { get; set; } = string.Empty;

    public LogLevelType LogLevel { get; set; }

    public string Message { get; set; } = string.Empty;

    public int? UserId { get; set; }

    public string? RequestUrl { get; set; }

    public string? HttpMethod { get; set; }

    public int? StatusCode { get; set; }

    /// <summary>Execution time of the originating operation, in milliseconds.</summary>
    public long? ExecutionTime { get; set; }

    public string? IpAddress { get; set; }

    public string? ExceptionMessage { get; set; }

    public string? StackTrace { get; set; }

    /// <summary>
    /// Correlation identifier used to trace a single request across
    /// multiple microservices. Auto-generated if the caller doesn't supply one.
    /// </summary>
    public string CorrelationId { get; set; } = Guid.NewGuid().ToString();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
