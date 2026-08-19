namespace HotelLoggingService.Application.Exceptions;

/// <summary>Thrown when a requested log record does not exist.</summary>
public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message)
    {
    }

    public static NotFoundException ForLog(long id) => new($"Log with Id '{id}' was not found.");
}
