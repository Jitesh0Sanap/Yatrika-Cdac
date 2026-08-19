using HotelLoggingService.Application.DTOs;
using HotelLoggingService.Domain.Entities;
using HotelLoggingService.Domain.Enums;

namespace HotelLoggingService.Application.Interfaces;

/// <summary>
/// Data-access contract for <see cref="LogEntry"/>. Implemented in the
/// Infrastructure layer using EF Core, keeping the Application layer
/// persistence-agnostic (a Repository Pattern boundary).
/// </summary>
public interface ILogRepository
{
    Task<LogEntry> AddAsync(LogEntry logEntry, CancellationToken cancellationToken = default);

    Task<LogEntry?> GetByIdAsync(long id, CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<LogEntry> Items, long TotalCount)> GetPagedAsync(
        LogFilterDto filter, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<LogEntry>> GetByLevelAsync(LogLevelType level, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<LogEntry>> GetByServiceNameAsync(string serviceName, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<LogEntry>> GetByDateRangeAsync(
        DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<LogEntry>> SearchAsync(string keyword, CancellationToken cancellationToken = default);

    Task<LogStatisticsDto> GetStatisticsAsync(CancellationToken cancellationToken = default);
}
