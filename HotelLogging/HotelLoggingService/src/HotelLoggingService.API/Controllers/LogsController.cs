using Asp.Versioning;
using HotelLoggingService.Application.Common;
using HotelLoggingService.Application.DTOs;
using HotelLoggingService.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HotelLoggingService.API.Controllers;

/// <summary>
/// Central endpoint set consumed by any Java Spring Boot microservice
/// (User, Hotel, Room, Booking, Payment, ...) to write and query logs.
/// No authentication is required on any endpoint in this build.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/logs")]
[Produces("application/json")]
public class LogsController : ControllerBase
{
    private readonly ILogService _logService;

    public LogsController(ILogService logService)
    {
        _logService = logService;
    }

    /// <summary>Stores a new log entry submitted by a consuming service.</summary>
    /// <response code="201">Log created successfully.</response>
    /// <response code="400">Validation failed.</response>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<LogResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object?>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] LogCreateDto dto, CancellationToken cancellationToken)
    {
        Console.WriteLine("POST API HIT");
        Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(dto));
        var created = await _logService.CreateLogAsync(dto, cancellationToken);
        var response = ApiResponse<LogResponseDto>.SuccessResponse(created, "Log saved successfully");
        return CreatedAtAction(nameof(GetById), new { id = created.Id, version = "1.0" }, response);
    }

    /// <summary>Returns logs with pagination, sorting, and optional filtering.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResultDto<LogResponseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] LogFilterDto filter, CancellationToken cancellationToken)
    {
        var result = await _logService.GetPagedAsync(filter, cancellationToken);
        return Ok(ApiResponse<PagedResultDto<LogResponseDto>>.SuccessResponse(result));
    }

    /// <summary>Returns a single log by its Id.</summary>
    [HttpGet("{id:long}")]
    [ProducesResponseType(typeof(ApiResponse<LogResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object?>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(long id, CancellationToken cancellationToken)
    {
        var log = await _logService.GetByIdAsync(id, cancellationToken);
        return Ok(ApiResponse<LogResponseDto>.SuccessResponse(log));
    }

    /// <summary>Deletes a log by its Id.</summary>
    [HttpDelete("{id:long}")]
    [ProducesResponseType(typeof(ApiResponse<object?>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object?>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(long id, CancellationToken cancellationToken)
    {
        await _logService.DeleteAsync(id, cancellationToken);
        return Ok(ApiResponse.Ok("Log deleted successfully"));
    }

    /// <summary>Returns only logs at Error level.</summary>
    [HttpGet("errors")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<LogResponseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetErrors(CancellationToken cancellationToken)
    {
        var logs = await _logService.GetErrorsAsync(cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<LogResponseDto>>.SuccessResponse(logs));
    }

    /// <summary>Returns logs for a single service name, e.g. "Booking Service".</summary>
    [HttpGet("service/{serviceName}")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<LogResponseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByServiceName(string serviceName, CancellationToken cancellationToken)
    {
        var logs = await _logService.GetByServiceNameAsync(serviceName, cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<LogResponseDto>>.SuccessResponse(logs));
    }

    /// <summary>Returns logs created between startDate and endDate (inclusive, UTC).</summary>
    [HttpGet("date")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<LogResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object?>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetByDateRange(
        [FromQuery] DateTime startDate, [FromQuery] DateTime endDate, CancellationToken cancellationToken)
    {
        var logs = await _logService.GetByDateRangeAsync(startDate, endDate, cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<LogResponseDto>>.SuccessResponse(logs));
    }

    /// <summary>Searches Message, ModuleName, ServiceName, and ExceptionMessage for a keyword.</summary>
    [HttpGet("search")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<LogResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object?>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Search([FromQuery] string keyword, CancellationToken cancellationToken)
    {
        var logs = await _logService.SearchAsync(keyword, cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<LogResponseDto>>.SuccessResponse(logs));
    }

    /// <summary>Returns aggregate statistics: total logs, errors, warnings, today's logs, logs per service.</summary>
    [HttpGet("statistics")]
    [ProducesResponseType(typeof(ApiResponse<LogStatisticsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStatistics(CancellationToken cancellationToken)
    {
        var stats = await _logService.GetStatisticsAsync(cancellationToken);
        return Ok(ApiResponse<LogStatisticsDto>.SuccessResponse(stats));
    }
}
