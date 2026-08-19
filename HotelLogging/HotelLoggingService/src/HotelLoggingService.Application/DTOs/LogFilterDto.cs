using HotelLoggingService.Domain.Enums;

namespace HotelLoggingService.Application.DTOs;

/// <summary>Query parameters accepted by GET /api/v1/logs.</summary>
public class LogFilterDto
{
    private int _page = 1;
    private int _pageSize = 20;

    public int Page
    {
        get => _page;
        set => _page = value < 1 ? 1 : value;
    }

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value switch
        {
            < 1 => 20,
            > 200 => 200,
            _ => value
        };
    }

    public LogLevelType? LogLevel { get; set; }

    public string? ServiceName { get; set; }

    public string? ModuleName { get; set; }

    /// <summary>Column to sort by: createdAt (default), serviceName, logLevel, statusCode.</summary>
    public string? SortBy { get; set; } = "createdAt";

    /// <summary>asc or desc (default).</summary>
    public string? SortDirection { get; set; } = "desc";
}
