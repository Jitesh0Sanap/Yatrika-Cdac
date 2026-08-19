using AutoMapper;
using HotelLoggingService.Application.DTOs;
using HotelLoggingService.Domain.Entities;

namespace HotelLoggingService.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<LogCreateDto, LogEntry>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.CorrelationId, opt => opt.MapFrom(
                src => string.IsNullOrWhiteSpace(src.CorrelationId) ? Guid.NewGuid().ToString() : src.CorrelationId));

        CreateMap<LogEntry, LogResponseDto>();
    }
}
