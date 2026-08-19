using System.ComponentModel.DataAnnotations;
using HotelLoggingService.Domain.Enums;

namespace HotelLoggingService.Application.DTOs;

/// <summary>
/// Payload submitted by a consuming microservice (e.g. Java Spring Boot)
/// via POST /api/v1/logs.
/// </summary>
public class LogCreateDto
{
    [Required(ErrorMessage = "ServiceName is required.")]
    [StringLength(150, ErrorMessage = "ServiceName cannot exceed 150 characters.")]
    public string ServiceName { get; set; } = string.Empty;

    [Required(ErrorMessage = "ModuleName is required.")]
    [StringLength(150, ErrorMessage = "ModuleName cannot exceed 150 characters.")]
    public string ModuleName { get; set; } = string.Empty;

    [Required(ErrorMessage = "LogLevel is required.")]
    public LogLevelType LogLevel { get; set; }

    [Required(ErrorMessage = "Message is required.")]
    [StringLength(4000, ErrorMessage = "Message cannot exceed 4000 characters.")]
    public string Message { get; set; } = string.Empty;

    public int? UserId { get; set; }

    [StringLength(500)]
    public string? RequestUrl { get; set; }

    [StringLength(10)]
    public string? HttpMethod { get; set; }

    [Range(100, 599, ErrorMessage = "StatusCode must be a valid HTTP status code.")]
    public int? StatusCode { get; set; }

    [Range(0, long.MaxValue, ErrorMessage = "ExecutionTime cannot be negative.")]
    public long? ExecutionTime { get; set; }

    [StringLength(45)]
    public string? IpAddress { get; set; }

    [StringLength(4000)]
    public string? ExceptionMessage { get; set; }

    public string? StackTrace { get; set; }

    /// <summary>
    /// Optional. If not supplied, the service generates one automatically,
    /// so callers can omit it for single, non-distributed log calls.
    /// </summary>
    [StringLength(100)]
    public string? CorrelationId { get; set; }
}
