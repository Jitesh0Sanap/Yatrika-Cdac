using System.Net;
using System.Text.Json;
using HotelLoggingService.Application.Common;
using HotelLoggingService.Application.Exceptions;
using HotelLoggingService.Application.Interfaces;

namespace HotelLoggingService.API.Middlewares;

/// <summary>
/// Catches every unhandled exception in the pipeline, converts it into the
/// standard <see cref="ApiResponse{T}"/> JSON shape, and persists the
/// exception details into the Logs table so failures are centrally visible.
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, ILogService logService)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception while processing {Path}", context.Request.Path);

            var (statusCode, message) = MapException(ex);
            var correlationId = context.Request.Headers["X-Correlation-Id"].FirstOrDefault() ?? Guid.NewGuid().ToString();

            try
            {
                await logService.LogExceptionAsync(
                    serviceName: "HotelLoggingService",
                    moduleName: context.Request.Path,
                    message: message,
                    exceptionMessage: ex.Message,
                    stackTrace: ex.StackTrace,
                    requestUrl: context.Request.Path,
                    httpMethod: context.Request.Method,
                    statusCode: statusCode,
                    correlationId: correlationId);
            }
            catch (Exception persistEx)
            {
                // Never let a logging failure mask the original exception response.
                _logger.LogError(persistEx, "Failed to persist exception log entry.");
            }

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = statusCode;

            var response = ApiResponse<object?>.FailureResponse(message, new List<string> { ex.Message });
            await context.Response.WriteAsync(JsonSerializer.Serialize(response, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            }));
        }
    }

    private static (int StatusCode, string Message) MapException(Exception ex) => ex switch
    {
        NotFoundException => ((int)HttpStatusCode.NotFound, ex.Message),
        ArgumentException => ((int)HttpStatusCode.BadRequest, ex.Message),
        _ => ((int)HttpStatusCode.InternalServerError, "An unexpected error occurred. Please try again later.")
    };
}
