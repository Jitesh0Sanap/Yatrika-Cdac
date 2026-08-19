# HotelLoggingService

A production-style **centralized logging microservice** built with **ASP.NET Core 10 / .NET 10**, designed to be called by a **Java Spring Boot Hotel Management System** (User, Hotel, Room, Booking, Payment services, etc.) over REST.

> **Note on authentication:** per your request, this build has **no JWT / auth layer** — every endpoint is open. Everything else from the full spec is included: Clean Architecture, EF Core + SQL Server, Repository + Service layers, AutoMapper, DTOs, Swagger, global exception middleware, Serilog, health checks, URL API versioning, rate limiting, and Docker support. See "Adding JWT later" at the bottom if you want to bolt it on afterward.

---

## 1. Folder structure

```
HotelLoggingService/
├── HotelLoggingService.sln
├── Dockerfile
├── docker-compose.yml
├── Scripts/
│   └── CreateDatabase.sql          # optional manual DB setup (alternative to EF migrations)
└── src/
    ├── HotelLoggingService.Domain/          # Entities + Enums. No dependencies on anything else.
    │   ├── Entities/LogEntry.cs
    │   └── Enums/LogLevelType.cs
    │
    ├── HotelLoggingService.Application/     # Business logic. Depends only on Domain.
    │   ├── DTOs/                            # LogCreateDto, LogResponseDto, LogFilterDto, PagedResultDto, LogStatisticsDto
    │   ├── Interfaces/                      # ILogRepository, ILogService — the ports of the hexagon
    │   ├── Services/LogService.cs           # Implements ILogService
    │   ├── Mappings/MappingProfile.cs       # AutoMapper entity <-> DTO
    │   ├── Common/ApiResponse.cs            # Standard {success, message, data} envelope
    │   └── Exceptions/NotFoundException.cs
    │
    ├── HotelLoggingService.Infrastructure/  # Persistence. Depends on Application (implements its interfaces).
    │   ├── Data/HotelLoggingDbContext.cs
    │   ├── Repositories/LogRepository.cs
    │   └── Migrations/                      # EF Core Code First migrations (InitialCreate)
    │
    └── HotelLoggingService.API/             # Composition root / HTTP layer.
        ├── Controllers/LogsController.cs
        ├── Middlewares/
        │   ├── ExceptionHandlingMiddleware.cs        # catches everything, writes to Logs table
        │   └── RequestResponseLoggingMiddleware.cs   # correlation-id + timing via Serilog
        ├── Extensions/
        │   ├── ServiceCollectionExtensions.cs        # DI registration, versioning, rate limiting, swagger, health checks
        │   └── ApplicationBuilderExtensions.cs       # middleware pipeline wiring
        ├── Program.cs
        ├── appsettings.json / appsettings.Development.json
        └── HotelLoggingService.API.csproj
```

**Why this dependency direction?** Domain has zero dependencies. Application depends only on Domain and defines interfaces (`ILogRepository`, `ILogService`) it needs — it doesn't know EF Core exists. Infrastructure implements those interfaces using EF Core. API wires everything together via DI. This is what lets you swap SQL Server for Postgres, or add RabbitMQ/Kafka later, by touching only Infrastructure — Application and Domain never change.

---

## 2. Database

Table: **Logs** (in database **HotelLoggingDB**)

| Column | Type | Notes |
|---|---|---|
| Id | BIGINT, identity | PK |
| ServiceName | NVARCHAR(150) | e.g. "Booking Service" |
| ModuleName | NVARCHAR(150) | e.g. "Create Booking" |
| LogLevel | NVARCHAR(20) | Debug \| Information \| Warning \| Error \| Critical (stored as string via EF's enum-to-string conversion) |
| Message | NVARCHAR(4000) | |
| UserId | INT, nullable | |
| RequestUrl | NVARCHAR(500), nullable | |
| HttpMethod | NVARCHAR(10), nullable | |
| StatusCode | INT, nullable | |
| ExecutionTime | BIGINT, nullable | milliseconds |
| IpAddress | NVARCHAR(45), nullable | |
| ExceptionMessage | NVARCHAR(4000), nullable | |
| StackTrace | NVARCHAR(MAX), nullable | |
| CorrelationId | NVARCHAR(100) | auto-generated if not supplied; ties one request across multiple services |
| CreatedAt | DATETIME2 | defaults to `GETUTCDATE()` at the DB level |

Indexes on `ServiceName`, `LogLevel`, `CreatedAt`, `CorrelationId` keep the filter/search endpoints fast as the table grows.

You can create the schema either way:

**Option A — EF Core migrations (recommended):**
```bash
cd src/HotelLoggingService.API
dotnet tool install --global dotnet-ef   # if not already installed
dotnet ef database update --project ../HotelLoggingService.Infrastructure --startup-project .
```

**Option B — run the raw SQL script:**
```bash
sqlcmd -S localhost -U sa -P "Your_password123" -i Scripts/CreateDatabase.sql
```

If you ever change an entity and need a new migration:
```bash
dotnet ef migrations add <Name> --project ../HotelLoggingService.Infrastructure --startup-project .
```

---

## 3. Connection string

Set in `appsettings.json` (and overridable via environment variable):

```json
"ConnectionStrings": {
  "HotelLoggingDB": "Server=localhost,1433;Database=HotelLoggingDB;User Id=sa;Password=Your_password123;TrustServerCertificate=True;"
}
```

Environment-variable override (useful in Docker/CI):
```
ConnectionStrings__HotelLoggingDB=Server=...;Database=HotelLoggingDB;...
```

**Change the SA password before doing anything real with this** — `Your_password123` is a placeholder.

---

## 4. Running locally (no Docker)

Prerequisites: .NET 10 SDK, a reachable SQL Server instance.

```bash
cd HotelLoggingService
dotnet restore
dotnet ef database update --project src/HotelLoggingService.Infrastructure --startup-project src/HotelLoggingService.API
dotnet run --project src/HotelLoggingService.API
```

Then open `http://localhost:5080/swagger` (or check the console for the actual bound port).

`/health` returns the SQL Server connectivity health check.

---

## 5. Running with Docker

```bash
cd HotelLoggingService
docker compose up --build
```

This starts:
- **hotel-logging-db** — SQL Server 2022 container, port `1433`
- **hotel-logging-api** — the API, port `8080`, waiting for the DB health check before starting

The API container does **not** run migrations automatically. After the containers are healthy, run once from your host machine:
```bash
dotnet ef database update --project src/HotelLoggingService.Infrastructure --startup-project src/HotelLoggingService.API
```
(or point `sqlcmd` at `localhost,1433` and run `Scripts/CreateDatabase.sql`).

---

## 6. API reference

Base path: `/api/v1/logs` (URL-segment versioning; `v1` is also assumed if you omit it).

| Method | Route | Purpose | Notes |
|---|---|---|---|
| POST | `/api/v1/logs` | Create a log | 201 Created |
| GET | `/api/v1/logs?page=1&pageSize=20&logLevel=Error&serviceName=Booking Service&sortBy=createdAt&sortDirection=desc` | Paged list | filtering + sorting |
| GET | `/api/v1/logs/{id}` | Single log | 404 if missing |
| DELETE | `/api/v1/logs/{id}` | Delete a log | 404 if missing |
| GET | `/api/v1/logs/errors` | Error-level logs only | |
| GET | `/api/v1/logs/service/{serviceName}` | Logs for one service | |
| GET | `/api/v1/logs/date?startDate=2026-07-01&endDate=2026-07-31` | Date-range logs | |
| GET | `/api/v1/logs/search?keyword=timeout` | Searches Message/ModuleName/ServiceName/ExceptionMessage | |
| GET | `/api/v1/logs/statistics` | Totals, today's count, per-service breakdown | |
| GET | `/health` | Liveness/DB health | |

### Sample request — create a log
```json
POST /api/v1/logs
{
  "serviceName": "Booking Service",
  "moduleName": "Create Booking",
  "logLevel": "Information",
  "message": "Booking created successfully",
  "userId": 5,
  "requestUrl": "/api/bookings",
  "httpMethod": "POST",
  "statusCode": 200,
  "executionTime": 160,
  "ipAddress": "127.0.0.1"
}
```

### Sample response
```json
{
  "success": true,
  "message": "Log saved successfully",
  "data": {
    "id": 101,
    "serviceName": "Booking Service",
    "moduleName": "Create Booking",
    "logLevel": 1,
    "logLevelName": "Information",
    "message": "Booking created successfully",
    "userId": 5,
    "requestUrl": "/api/bookings",
    "httpMethod": "POST",
    "statusCode": 200,
    "executionTime": 160,
    "ipAddress": "127.0.0.1",
    "exceptionMessage": null,
    "stackTrace": null,
    "correlationId": "3f1a2b6e-9c1d-4e2a-9b0e-2b6b6a1c9d10",
    "createdAt": "2026-08-02T10:15:30Z"
  }
}
```

### Validation error example
```json
{
  "success": false,
  "message": "Validation failed.",
  "data": null,
  "errors": [
    "ServiceName is required.",
    "LogLevel is required."
  ]
}
```

### Rate limiting
Fixed-window limiter, per client IP, configurable in `appsettings.json` under `RateLimiting` (`PermitLimit`, `WindowSeconds`, `QueueLimit`). Exceeding the limit returns `429 Too Many Requests`.

---

## 7. Calling this API from Java Spring Boot

### Using `RestTemplate`
```java
RestTemplate restTemplate = new RestTemplate();

Map<String, Object> logPayload = new HashMap<>();
logPayload.put("serviceName", "Booking Service");
logPayload.put("moduleName", "Create Booking");
logPayload.put("logLevel", "Information");
logPayload.put("message", "Booking created successfully");
logPayload.put("userId", 5);
logPayload.put("requestUrl", "/api/bookings");
logPayload.put("httpMethod", "POST");
logPayload.put("statusCode", 200);
logPayload.put("executionTime", 160);
logPayload.put("ipAddress", "127.0.0.1");

HttpHeaders headers = new HttpHeaders();
headers.setContentType(MediaType.APPLICATION_JSON);
HttpEntity<Map<String, Object>> request = new HttpEntity<>(logPayload, headers);

ResponseEntity<String> response = restTemplate.postForEntity(
    "http://hotel-logging-api:8080/api/v1/logs", request, String.class);
```

### Using `WebClient` (reactive, recommended for new code)
```java
WebClient webClient = WebClient.builder()
    .baseUrl("http://hotel-logging-api:8080")
    .build();

Map<String, Object> logPayload = Map.of(
    "serviceName", "Booking Service",
    "moduleName", "Create Booking",
    "logLevel", "Information",
    "message", "Booking created successfully",
    "userId", 5,
    "requestUrl", "/api/bookings",
    "httpMethod", "POST",
    "statusCode", 200,
    "executionTime", 160,
    "ipAddress", "127.0.0.1"
);

webClient.post()
    .uri("/api/v1/logs")
    .contentType(MediaType.APPLICATION_JSON)
    .bodyValue(logPayload)
    .retrieve()
    .bodyToMono(String.class)
    .subscribe(resp -> System.out.println("Log sent: " + resp));
```

Tip: pass `X-Correlation-Id` as a request header from Spring Boot if you want one correlation ID to follow a single business transaction across the Booking, Payment, and Logging services.

---

## 8. Future scalability (RabbitMQ / Kafka)

`ILogService` / `ILogRepository` are the only seams the API talks through. To move to an async, queue-based ingestion model later:
1. Add a message consumer (RabbitMQ/Kafka) in Infrastructure that deserializes incoming messages into `LogCreateDto` and calls the existing `ILogService.CreateLogAsync`.
2. Leave `POST /api/v1/logs` in place for services that still want synchronous REST calls.
3. No changes needed in Domain or Application.

---

## 9. Adding JWT later (optional)

This build intentionally ships without auth. To add it:
1. `dotnet add src/HotelLoggingService.API package Microsoft.AspNetCore.Authentication.JwtBearer`
2. Register `AddAuthentication().AddJwtBearer(...)` in `Program.cs`, add `app.UseAuthentication()` before `app.UseAuthorization()`.
3. Add `[Authorize]` to `LogsController` and `[AllowAnonymous]` on the `Create` action only (so consuming services can still post logs without a token, matching the original design intent).

---

## 10. Key classes at a glance

- **`LogEntry`** (Domain) — the persisted record shape.
- **`LogLevelType`** (Domain) — Debug/Information/Warning/Error/Critical enum, stored as a string column via EF's value conversion so the DB stays human-readable.
- **`ILogRepository` / `LogRepository`** — Repository Pattern: all EF Core querying lives here, nowhere else.
- **`ILogService` / `LogService`** — business rules (e.g. rejecting an empty search keyword, wrapping exceptions into `NotFoundException`).
- **`ApiResponse<T>`** — the `{success, message, data}` envelope every endpoint returns.
- **`ExceptionHandlingMiddleware`** — converts any unhandled exception into a JSON `ApiResponse` and writes it to the `Logs` table as a `Critical` entry, so failures in *this* service are self-logging.
- **`RequestResponseLoggingMiddleware`** — stamps/propagates `X-Correlation-Id` and logs request timing via Serilog.
- **`ServiceCollectionExtensions`** — one place where EF Core, versioning, rate limiting, Swagger, and health checks are registered, keeping `Program.cs` short.

---

## 11. Build check

This project targets `net10.0` and was written against the ASP.NET Core 10 / EF Core 10 API surface. Since package restore requires network access to nuget.org, verify the build in your own environment:
```bash
dotnet restore
dotnet build
```
If a package version listed in a `.csproj` has been superseded by the time you build, bump it to the latest `10.x` release of that package — the code itself doesn't depend on a specific patch version.
