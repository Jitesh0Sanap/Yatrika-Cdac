using HotelLoggingService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace HotelLoggingService.Infrastructure.Migrations;

/// <summary>
/// Lets you run "dotnet ef migrations add ..." / "dotnet ef database update"
/// directly from the Infrastructure project without needing the API project
/// to be the startup project. Uses a fallback connection string only for
/// design-time tooling; the real app always uses appsettings.json.
/// </summary>
public class HotelLoggingDbContextFactory : IDesignTimeDbContextFactory<HotelLoggingDbContext>
{
    public HotelLoggingDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("HOTELLOGGING_CONNECTION_STRING")
            ?? "Server=(localdb)\\MSSQLLocalDB;Database=HotelLoggingDB;Trusted_Connection=True;TrustServerCertificate=True;";

        var optionsBuilder = new DbContextOptionsBuilder<HotelLoggingDbContext>();
        optionsBuilder.UseSqlServer(connectionString);

        return new HotelLoggingDbContext(optionsBuilder.Options);
    }
}
