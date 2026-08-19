using AutoMapper;
using HotelLoggingService.Application.DTOs;
using HotelLoggingService.Application.Exceptions;
using HotelLoggingService.Application.Interfaces;
using HotelLoggingService.Domain.Entities;
using HotelLoggingService.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace HotelLoggingService.Application.Services;

/// <summary>
/// Implements <see cref="ILogService"/>. Contains all business rules for
/// working with centralized logs; delegates persistence to <see cref="ILogRepository"/>.
/// </summary>
public class LogService : ILogService
{
    private readonly ILogRepository _logRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<LogService> _logger;

    public LogService(ILogRepository logRepository, IMapper mapper, ILogger<LogService> logger)
    {
        _logRepository = logRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<LogResponseDto> CreateLogAsync(LogCreateDto dto, CancellationToken cancellationToken = default)
    {
        var entity = _mapper.Map<LogEntry>(dto);

        entity.CreatedAt = DateTime.UtcNow;

        var saved = await _logRepository.AddAsync(entity, cancellationToken);

        _logger.LogInformation(
            "Log persisted. Service={ServiceName} Module={ModuleName} Level={LogLevel} CorrelationId={CorrelationId}",
            saved.ServiceName,
            saved.ModuleName,
            saved.LogLevel,
            saved.CorrelationId);

        return _mapper.Map<LogResponseDto>(saved);
    }

    public async Task<LogResponseDto> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _logRepository.GetByIdAsync(id, cancellationToken)
            ?? throw NotFoundException.ForLog(id);

        return _mapper.Map<LogResponseDto>(entity);
    }

    public async Task DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        var deleted = await _logRepository.DeleteAsync(id, cancellationToken);
        if (!deleted)
        {
            throw NotFoundException.ForLog(id);
        }
    }

    public async Task<PagedResultDto<LogResponseDto>> GetPagedAsync(LogFilterDto filter, CancellationToken cancellationToken = default)
    {
        var (items, totalCount) = await _logRepository.GetPagedAsync(filter, cancellationToken);

        return new PagedResultDto<LogResponseDto>
        {
            Items = items.Select(_mapper.Map<LogResponseDto>).ToList(),
            Page = filter.Page,
            PageSize = filter.PageSize,
            TotalCount = totalCount
        };
    }

    public async Task<IReadOnlyList<LogResponseDto>> GetErrorsAsync(CancellationToken cancellationToken = default)
    {
        var items = await _logRepository.GetByLevelAsync(LogLevelType.Error, cancellationToken);
        return items.Select(_mapper.Map<LogResponseDto>).ToList();
    }

    public async Task<IReadOnlyList<LogResponseDto>> GetByServiceNameAsync(string serviceName, CancellationToken cancellationToken = default)
    {
        var items = await _logRepository.GetByServiceNameAsync(serviceName, cancellationToken);
        return items.Select(_mapper.Map<LogResponseDto>).ToList();
    }

    public async Task<IReadOnlyList<LogResponseDto>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        if (startDate > endDate)
        {
            throw new ArgumentException("startDate cannot be later than endDate.");
        }

        var items = await _logRepository.GetByDateRangeAsync(startDate, endDate, cancellationToken);
        return items.Select(_mapper.Map<LogResponseDto>).ToList();
    }

    public async Task<IReadOnlyList<LogResponseDto>> SearchAsync(string keyword, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(keyword))
        {
            throw new ArgumentException("Search keyword cannot be empty.");
        }

        var items = await _logRepository.SearchAsync(keyword, cancellationToken);
        return items.Select(_mapper.Map<LogResponseDto>).ToList();
    }

    public Task<LogStatisticsDto> GetStatisticsAsync(CancellationToken cancellationToken = default)
        => _logRepository.GetStatisticsAsync(cancellationToken);

    public async Task LogExceptionAsync(
        string serviceName,
        string moduleName,
        string message,
        string? exceptionMessage,
        string? stackTrace,
        string? requestUrl,
        string? httpMethod,
        int? statusCode,
        string? correlationId,
        CancellationToken cancellationToken = default)
    {
        var entity = new LogEntry
        {
            ServiceName = serviceName,
            ModuleName = moduleName,
            LogLevel = LogLevelType.Critical,
            Message = message,
            ExceptionMessage = exceptionMessage,
            StackTrace = stackTrace,
            RequestUrl = requestUrl,
            HttpMethod = httpMethod,
            StatusCode = statusCode,
            CorrelationId = string.IsNullOrWhiteSpace(correlationId) ? Guid.NewGuid().ToString() : correlationId,
            CreatedAt = DateTime.UtcNow
        };

        await _logRepository.AddAsync(entity, cancellationToken);
    }
}
