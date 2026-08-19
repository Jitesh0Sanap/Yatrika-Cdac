using System.Diagnostics;

namespace HotelLoggingService.API.Middlewares;

/// <summary>
/// Ensures every request has a correlation ID (generating one if the caller
/// didn't supply one via X-Correlation-Id) and logs request/response timing
/// through Serilog for observability.
/// </summary>
public class RequestResponseLoggingMiddleware
{
    private const string CorrelationHeaderName = "X-Correlation-Id";

    private readonly RequestDelegate _next;
    private readonly ILogger<RequestResponseLoggingMiddleware> _logger;

    public RequestResponseLoggingMiddleware(RequestDelegate next, ILogger<RequestResponseLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var correlationId = context.Request.Headers.TryGetValue(CorrelationHeaderName, out var existing) && !string.IsNullOrWhiteSpace(existing)
            ? existing.ToString()
            : Guid.NewGuid().ToString();

        context.Request.Headers[CorrelationHeaderName] = correlationId;
        context.Response.Headers[CorrelationHeaderName] = correlationId;

        using (_logger.BeginScope(new Dictionary<string, object> { ["CorrelationId"] = correlationId }))
        {
            var stopwatch = Stopwatch.StartNew();

            _logger.LogInformation("Incoming request {Method} {Path}", context.Request.Method, context.Request.Path);

            await _next(context);

            stopwatch.Stop();

            _logger.LogInformation(
                "Completed request {Method} {Path} with {StatusCode} in {ElapsedMilliseconds}ms",
                context.Request.Method, context.Request.Path, context.Response.StatusCode, stopwatch.ElapsedMilliseconds);
        }
    }
}
