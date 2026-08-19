using System.Threading.RateLimiting;
using Asp.Versioning;
using HotelLoggingService.Application.Interfaces;
using HotelLoggingService.Application.Mappings;
using HotelLoggingService.Application.Services;
using HotelLoggingService.Infrastructure.Data;
using HotelLoggingService.Infrastructure.Repositories;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

namespace HotelLoggingService.API.Extensions;

public static class ServiceCollectionExtensions
{
    /// <summary>Registers EF Core, repositories, application services, and AutoMapper.</summary>
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<HotelLoggingDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("HotelLoggingDB"),
                sqlOptions => sqlOptions.MigrationsAssembly("HotelLoggingService.Infrastructure")));

        services.AddScoped<ILogRepository, LogRepository>();
        services.AddScoped<ILogService, LogService>();

        services.AddAutoMapper(cfg => cfg.AddProfile<MappingProfile>());

        return services;
    }

    /// <summary>Configures URL-segment API versioning (/api/v1/...).</summary>
    public static IServiceCollection AddApiVersioningConfiguration(this IServiceCollection services)
    {
        services.AddApiVersioning(options =>
        {
            options.DefaultApiVersion = new ApiVersion(1, 0);
            options.AssumeDefaultVersionWhenUnspecified = true;
            options.ReportApiVersions = true;
        }).AddApiExplorer(options =>
        {
            options.GroupNameFormat = "'v'VVV";
            options.SubstituteApiVersionInUrl = true;
        });

        return services;
    }

    /// <summary>Configures a fixed-window rate limiter to prevent API abuse.</summary>
    public static IServiceCollection AddRateLimitingConfiguration(this IServiceCollection services, IConfiguration configuration)
    {
        var permitLimit = configuration.GetValue("RateLimiting:PermitLimit", 100);
        var windowSeconds = configuration.GetValue("RateLimiting:WindowSeconds", 60);
        var queueLimit = configuration.GetValue("RateLimiting:QueueLimit", 10);

        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = permitLimit,
                        Window = TimeSpan.FromSeconds(windowSeconds),
                        QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                        QueueLimit = queueLimit
                    }));
        });

        return services;
    }

    /// <summary>Configures Swagger/OpenAPI with versioned documents.</summary>
    public static IServiceCollection AddSwaggerConfiguration(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Hotel Logging Service API",
                Version = "v1",
                Description = "Centralized logging microservice consumed by the Java Spring Boot Hotel Management System."
            });

            options.AddSecurityDefinition("CorrelationId", new OpenApiSecurityScheme
            {
                Name = "X-Correlation-Id",
                Type = SecuritySchemeType.ApiKey,
                In = ParameterLocation.Header,
                Description = "Optional correlation ID to trace a request across microservices."
            });
        });

        return services;
    }

    /// <summary>Adds SQL Server health check under /health.</summary>
    public static IServiceCollection AddHealthCheckConfiguration(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddHealthChecks()
            .AddSqlServer(
                connectionString: configuration.GetConnectionString("HotelLoggingDB")!,
                name: "sql-server",
                failureStatus: Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Unhealthy,
                tags: new[] { "db", "sql", "sqlserver" });

        return services;
    }
}
