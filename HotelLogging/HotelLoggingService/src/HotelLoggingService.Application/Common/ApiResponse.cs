namespace HotelLoggingService.Application.Common;

/// <summary>
/// Standard envelope returned by every endpoint in this API so that
/// consuming clients (e.g. the Java Spring Boot services) can rely on
/// a single, predictable JSON shape.
/// </summary>
/// <typeparam name="T">Type of the payload returned in <see cref="Data"/>.</typeparam>
public class ApiResponse<T>
{
    public bool Success { get; set; }

    public string Message { get; set; } = string.Empty;

    public T? Data { get; set; }

    /// <summary>Optional list of validation / business errors.</summary>
    public List<string>? Errors { get; set; }

    public static ApiResponse<T> SuccessResponse(T data, string message = "Operation completed successfully")
    {
        return new ApiResponse<T>
        {
            Success = true,
            Message = message,
            Data = data
        };
    }

    public static ApiResponse<T> FailureResponse(string message, List<string>? errors = null)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Message = message,
            Data = default,
            Errors = errors
        };
    }
}

/// <summary>Non-generic convenience variant for endpoints with no payload (e.g. delete).</summary>
public class ApiResponse : ApiResponse<object?>
{
    public static ApiResponse Ok(string message = "Operation completed successfully")
    {
        return new ApiResponse
        {
            Success = true,
            Message = message,
            Data = null
        };
    }
}
