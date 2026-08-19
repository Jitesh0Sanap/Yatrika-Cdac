package com.yatrika.dto;

import com.yatrika.enums.LogLevel;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LogEntryRequest {
    private String serviceName;
    private String moduleName;
    private LogLevel logLevel;
    private String message;
    private Integer userId;
    private String requestUrl;
    private String httpMethod;
    private Integer statusCode;
    private Long executionTime;
    private String ipAddress;
    private String exceptionMessage;
    private String stackTrace;
    private String correlationId;
}