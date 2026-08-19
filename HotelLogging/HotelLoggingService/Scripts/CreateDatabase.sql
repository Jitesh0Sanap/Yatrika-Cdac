-- =========================================================
-- HotelLoggingService - manual SQL setup (optional).
-- Use this if you'd rather not run EF Core migrations.
-- =========================================================

IF DB_ID('HotelLoggingDB') IS NULL
BEGIN
    CREATE DATABASE HotelLoggingDB;
END
GO

USE HotelLoggingDB;
GO

IF OBJECT_ID('dbo.Logs', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Logs
    (
        Id                  BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Logs PRIMARY KEY,
        ServiceName         NVARCHAR(150)  NOT NULL,
        ModuleName          NVARCHAR(150)  NOT NULL,
        LogLevel            NVARCHAR(20)   NOT NULL,   -- Debug | Information | Warning | Error | Critical
        Message             NVARCHAR(4000) NOT NULL,
        UserId              INT            NULL,
        RequestUrl          NVARCHAR(500)  NULL,
        HttpMethod          NVARCHAR(10)   NULL,
        StatusCode          INT            NULL,
        ExecutionTime       BIGINT         NULL,
        IpAddress           NVARCHAR(45)   NULL,
        ExceptionMessage    NVARCHAR(4000) NULL,
        StackTrace          NVARCHAR(MAX)  NULL,
        CorrelationId       NVARCHAR(100)  NOT NULL,
        CreatedAt           DATETIME2      NOT NULL CONSTRAINT DF_Logs_CreatedAt DEFAULT (GETUTCDATE())
    );

    CREATE INDEX IX_Logs_ServiceName    ON dbo.Logs (ServiceName);
    CREATE INDEX IX_Logs_LogLevel       ON dbo.Logs (LogLevel);
    CREATE INDEX IX_Logs_CreatedAt      ON dbo.Logs (CreatedAt);
    CREATE INDEX IX_Logs_CorrelationId  ON dbo.Logs (CorrelationId);
END
GO
