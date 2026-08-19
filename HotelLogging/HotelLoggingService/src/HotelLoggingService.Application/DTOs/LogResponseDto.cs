using HotelLoggingService.Domain.Enums;

namespace HotelLoggingService.Application.DTOs;

/// <summary>Shape returned to clients for a single log record.</summary>
public class LogResponseDto
{
    public long Id { get; set; }
    public string ServiceName { get; set; } = string.Empty;
    public string ModuleName { get; set; } = string.Empty;
    public LogLevelType LogLevel { get; set; }
    public string LogLevelName => LogLevel.ToString();
    public string Message { get; set; } = string.Empty;
    public int? UserId { get; set; }
    public string? RequestUrl { get; set; }
    public string? HttpMethod { get; set; }
    public int? StatusCode { get; set; }
    public long? ExecutionTime { get; set; }
    public string? IpAddress { get; set; }
    public string? ExceptionMessage { get; set; }
    public string? StackTrace { get; set; }
    public string CorrelationId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
