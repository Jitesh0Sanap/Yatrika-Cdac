using HotelLoggingService.API.Extensions;
using HotelLoggingService.Application.Common;
using Microsoft.AspNetCore.Mvc;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// ---- Serilog ----
builder.Host.UseSerilog((context, services, configuration) =>
    configuration.ReadFrom.Configuration(context.Configuration));

// ---- Standardized validation error responses ----
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(entry => entry.Value?.Errors.Count > 0)
            .SelectMany(entry => entry.Value!.Errors.Select(e => e.ErrorMessage))
            .ToList();

        var response = ApiResponse<object?>.FailureResponse("Validation failed.", errors);
        return new BadRequestObjectResult(response);
    };
});

// ---- Application services (EF Core, Repositories, Services, AutoMapper) ----
builder.Services.AddApplicationServices(builder.Configuration);

// ---- Controllers ----
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// ---- API Versioning ----
builder.Services.AddApiVersioningConfiguration();

// ---- Rate Limiting ----
builder.Services.AddRateLimitingConfiguration(builder.Configuration);

// ---- Swagger / OpenAPI ----
builder.Services.AddSwaggerConfiguration();

// ---- Health Checks ----
builder.Services.AddHealthCheckConfiguration(builder.Configuration);

// ---- CORS: open by default so any Spring Boot service can call this API ----
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

// ---- Middleware pipeline ----
app.UseHotelLoggingPipeline(); // exception handling + correlation-id/request logging

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Hotel Logging Service API v1");
    });
}

//app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseRateLimiter();

app.MapControllers();
app.MapHealthChecks("/health");

try
{
    Log.Information("Starting HotelLoggingService");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "HotelLoggingService terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
