using HotelLoggingService.Application.DTOs;
using HotelLoggingService.Application.Interfaces;
using HotelLoggingService.Domain.Entities;
using HotelLoggingService.Domain.Enums;
using HotelLoggingService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HotelLoggingService.Infrastructure.Repositories;

public class LogRepository : ILogRepository
{
    private readonly HotelLoggingDbContext _context;

    public LogRepository(HotelLoggingDbContext context)
    {
        _context = context;
    }

    public async Task<LogEntry> AddAsync(LogEntry logEntry, CancellationToken cancellationToken = default)
    {
        await _context.Logs.AddAsync(logEntry, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return logEntry;
    }

    public Task<LogEntry?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
        => _context.Logs.AsNoTracking().FirstOrDefaultAsync(l => l.Id == id, cancellationToken);

    public async Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _context.Logs.FirstOrDefaultAsync(l => l.Id == id, cancellationToken);
        if (entity is null)
        {
            return false;
        }

        _context.Logs.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<(IReadOnlyList<LogEntry> Items, long TotalCount)> GetPagedAsync(
        LogFilterDto filter, CancellationToken cancellationToken = default)
    {
        var query = _context.Logs.AsNoTracking().AsQueryable();

        if (filter.LogLevel.HasValue)
        {
            query = query.Where(l => l.LogLevel == filter.LogLevel.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.ServiceName))
        {
            query = query.Where(l => l.ServiceName == filter.ServiceName);
        }

        if (!string.IsNullOrWhiteSpace(filter.ModuleName))
        {
            query = query.Where(l => l.ModuleName == filter.ModuleName);
        }

        var totalCount = await query.LongCountAsync(cancellationToken);

        var descending = !string.Equals(filter.SortDirection, "asc", StringComparison.OrdinalIgnoreCase);

        query = filter.SortBy?.ToLowerInvariant() switch
        {
            "servicename" => descending ? query.OrderByDescending(l => l.ServiceName) : query.OrderBy(l => l.ServiceName),
            "loglevel" => descending ? query.OrderByDescending(l => l.LogLevel) : query.OrderBy(l => l.LogLevel),
            "statuscode" => descending ? query.OrderByDescending(l => l.StatusCode) : query.OrderBy(l => l.StatusCode),
            _ => descending ? query.OrderByDescending(l => l.CreatedAt) : query.OrderBy(l => l.CreatedAt)
        };

        var items = await query
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public Task<IReadOnlyList<LogEntry>> GetByLevelAsync(LogLevelType level, CancellationToken cancellationToken = default)
        => QueryToListAsync(_context.Logs.AsNoTracking()
            .Where(l => l.LogLevel == level)
            .OrderByDescending(l => l.CreatedAt), cancellationToken);

    public Task<IReadOnlyList<LogEntry>> GetByServiceNameAsync(string serviceName, CancellationToken cancellationToken = default)
        => QueryToListAsync(_context.Logs.AsNoTracking()
            .Where(l => l.ServiceName == serviceName)
            .OrderByDescending(l => l.CreatedAt), cancellationToken);

    public Task<IReadOnlyList<LogEntry>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
        => QueryToListAsync(_context.Logs.AsNoTracking()
            .Where(l => l.CreatedAt >= startDate && l.CreatedAt <= endDate)
            .OrderByDescending(l => l.CreatedAt), cancellationToken);

    public Task<IReadOnlyList<LogEntry>> SearchAsync(string keyword, CancellationToken cancellationToken = default)
    {
        var pattern = $"%{keyword}%";

        return QueryToListAsync(_context.Logs.AsNoTracking()
            .Where(l =>
                EF.Functions.Like(l.Message, pattern) ||
                EF.Functions.Like(l.ModuleName, pattern) ||
                EF.Functions.Like(l.ServiceName, pattern) ||
                (l.ExceptionMessage != null && EF.Functions.Like(l.ExceptionMessage, pattern)))
            .OrderByDescending(l => l.CreatedAt), cancellationToken);
    }

    public async Task<LogStatisticsDto> GetStatisticsAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;

        var totalLogs = await _context.Logs.LongCountAsync(cancellationToken);
        var totalErrors = await _context.Logs.LongCountAsync(l => l.LogLevel == LogLevelType.Error, cancellationToken);
        var totalWarnings = await _context.Logs.LongCountAsync(l => l.LogLevel == LogLevelType.Warning, cancellationToken);
        var totalCritical = await _context.Logs.LongCountAsync(l => l.LogLevel == LogLevelType.Critical, cancellationToken);
        var todaysLogs = await _context.Logs.LongCountAsync(l => l.CreatedAt >= today, cancellationToken);

        var perService = await _context.Logs
            .GroupBy(l => l.ServiceName)
            .Select(g => new { ServiceName = g.Key, Count = (long)g.Count() })
            .ToListAsync(cancellationToken);

        return new LogStatisticsDto
        {
            TotalLogs = totalLogs,
            TotalErrors = totalErrors,
            TotalWarnings = totalWarnings,
            TotalCritical = totalCritical,
            TodaysLogs = todaysLogs,
            LogsPerService = perService.ToDictionary(x => x.ServiceName, x => x.Count)
        };
    }

    private static async Task<IReadOnlyList<LogEntry>> QueryToListAsync(IQueryable<LogEntry> query, CancellationToken cancellationToken)
        => await query.ToListAsync(cancellationToken);
}
