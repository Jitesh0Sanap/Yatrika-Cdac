FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY HotelLoggingService.sln ./
COPY src/HotelLoggingService.API/HotelLoggingService.API.csproj src/HotelLoggingService.API/
COPY src/HotelLoggingService.Application/HotelLoggingService.Application.csproj src/HotelLoggingService.Application/
COPY src/HotelLoggingService.Domain/HotelLoggingService.Domain.csproj src/HotelLoggingService.Domain/
COPY src/HotelLoggingService.Infrastructure/HotelLoggingService.Infrastructure.csproj src/HotelLoggingService.Infrastructure/

RUN dotnet restore HotelLoggingService.sln

COPY . .

RUN dotnet publish src/HotelLoggingService.API/HotelLoggingService.API.csproj \
    -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

RUN useradd --uid 5678 --user-group --no-create-home appuser
USER appuser

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "HotelLoggingService.API.dll"]
