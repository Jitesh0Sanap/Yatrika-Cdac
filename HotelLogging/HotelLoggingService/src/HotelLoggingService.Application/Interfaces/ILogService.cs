using HotelLoggingService.Application.DTOs;
using HotelLoggingService.Domain.Enums;

namespace HotelLoggingService.Application.Interfaces;

/// <summary>Business-logic contract consumed by the API controllers.</summary>
public interface ILogService
{
    Task<LogResponseDto> CreateLogAsync(LogCreateDto dto, CancellationToken cancellationToken = default);

    Task<LogResponseDto> GetByIdAsync(long id, CancellationToken cancellationToken = default);

    Task DeleteAsync(long id, CancellationToken cancellationToken = default);

    Task<PagedResultDto<LogResponseDto>> GetPagedAsync(LogFilterDto filter, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<LogResponseDto>> GetErrorsAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<LogResponseDto>> GetByServiceNameAsync(string serviceName, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<LogResponseDto>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<LogResponseDto>> SearchAsync(string keyword, CancellationToken cancellationToken = default);

    Task<LogStatisticsDto> GetStatisticsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Used internally by the global exception middleware to persist
    /// unhandled exceptions straight to the Logs table.
    /// </summary>
    Task LogExceptionAsync(
        string serviceName,
        string moduleName,
        string message,
        string? exceptionMessage,
        string? stackTrace,
        string? requestUrl,
        string? httpMethod,
        int? statusCode,
        string? correlationId,
        CancellationToken cancellationToken = default);
}
