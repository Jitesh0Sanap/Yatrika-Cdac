using HotelLoggingService.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HotelLoggingService.Infrastructure.Data;

public class HotelLoggingDbContext : DbContext
{
    public HotelLoggingDbContext(DbContextOptions<HotelLoggingDbContext> options) : base(options)
    {
    }

    public DbSet<LogEntry> Logs => Set<LogEntry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<LogEntry>(entity =>
        {
            entity.ToTable("Logs");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.ServiceName)
                .IsRequired()
                .HasMaxLength(150);

            entity.Property(e => e.ModuleName)
                .IsRequired()
                .HasMaxLength(150);

            entity.Property(e => e.LogLevel)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(20);

            entity.Property(e => e.Message)
                .IsRequired()
                .HasMaxLength(4000);

            entity.Property(e => e.RequestUrl).HasMaxLength(500);
            entity.Property(e => e.HttpMethod).HasMaxLength(10);
            entity.Property(e => e.IpAddress).HasMaxLength(45);
            entity.Property(e => e.ExceptionMessage).HasMaxLength(4000);
            entity.Property(e => e.StackTrace).HasColumnType("nvarchar(max)");
            entity.Property(e => e.CorrelationId).HasMaxLength(100);

            entity.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            // Indexes to keep the filter/search endpoints fast at scale.
            entity.HasIndex(e => e.ServiceName);
            entity.HasIndex(e => e.LogLevel);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => e.CorrelationId);
        });
    }
}
