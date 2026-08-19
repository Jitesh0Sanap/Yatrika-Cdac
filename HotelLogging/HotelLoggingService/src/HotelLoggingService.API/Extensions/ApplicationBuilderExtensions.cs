using HotelLoggingService.API.Middlewares;

namespace HotelLoggingService.API.Extensions;

public static class ApplicationBuilderExtensions
{
    /// <summary>Wires up correlation-id logging and global exception handling, in the correct order.</summary>
    public static IApplicationBuilder UseHotelLoggingPipeline(this IApplicationBuilder app)
    {
        app.UseMiddleware<ExceptionHandlingMiddleware>();
        app.UseMiddleware<RequestResponseLoggingMiddleware>();
        return app;
    }
}
