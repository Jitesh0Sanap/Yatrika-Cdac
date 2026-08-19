namespace HotelLoggingService.Application.DTOs;

public class LogStatisticsDto
{
    public long TotalLogs { get; set; }
    public long TotalErrors { get; set; }
    public long TotalWarnings { get; set; }
    public long TotalCritical { get; set; }
    public long TodaysLogs { get; set; }
    public Dictionary<string, long> LogsPerService { get; set; } = new();
}
